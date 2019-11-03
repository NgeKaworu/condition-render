import React, { isValidElement, cloneElement } from 'react';
import compose from './utils/compose';
import getIn from './utils/getIn';

export default (condition, params) => dispense(params)(condition);

/**
 * parse condition And classification
 * @param {Object} params : Conditin Object , a ReactElement's description
 * @param {*} key : unicon key
 * @return {Object | Array} ReactElement | ReactElements
 */
function dispense(params = {}, key) {
  return condition => {
    const { '@pParams': paramChain, '@pDecorator': decoratorChain } = params;
    // If is a React Class, Decorator
    if (isReactClass(condition)) {
      const Component = condition;
      return compose(
        injectKey(key),
        decoratorEnhance(decoratorChain, paramChain),
      )(<Component />);
    }

    // is a function IoC
    if (typeof condition === 'function') {
      return injectKey(key)(condition(params));
    }

    // If is a React instance, Decorator
    if (isValidElement(condition)) {
      return compose(
        injectKey(key),
        decoratorEnhance(decoratorChain, paramChain),
      )(condition);
    }

    // If is a Array, to classify
    if (Array.isArray(condition)) {
      return condition.map((c, idx) => dispense(params, idx)(c));
    }

    // If is a Object, process condition object
    if (typeof condition === 'object' && condition !== null) {
      return injectKey(key)(recombineObject(condition, params));
    }

    // is a anthoer else
    return injectKey(key)(condition);
  };
}

/**
 *
 * @param {Object} condition : Condition Object
 * @param {*} params : extra for inherit or decorator
 * @returns {Array} ReactElements
 */
export function recombineObject(condition = {}, params = {}) {
  const { '@component': component, '@decorator': decorator, ...restCondition } = condition;
  const { '@pDecorator': pDecorator, ...restParams } = params;

  const decoratorChain = formatValidChain(pDecorator, decorator);
  const paramChain = filterEmptyKey({ ...restCondition, ...restParams });
  if (component && typeof component === 'object' && !isValidElement(component)) {
    const inheritChain = filterEmptyKey({
      '@pParams': paramChain,
      '@pDecorator': decoratorChain,
    });
    return dispense(inheritChain)(component);
  }

  return compose(
    decoratorEnhance(decoratorChain, paramChain),
    dispense(paramChain),
  )(component);
}

/**
 * decorator to target
 * @param {Array} decorator : decoratorChain
 * @param {Object} params : all condtion chain props
 */
export function decoratorEnhance(decorator, params) {
  return component =>
    functionHoist(decorator).reduceRight((acc, cur, key) => {
      if ((typeof cur === 'object' && !isValidElement(cur)) || Array.isArray(cur)) {
        throw new Error('@decorator just arrow decorator or ReactElement');
      }
      // if it's a function then ioc
      if (typeof cur === 'function' && !isReactClass(cur)) {
        return injectKey(key)(cur(acc, params));
      }
      // else render and wrap it

      const parseDecorator = dispense(params)(cur);
      return cloneElement(parseDecorator, {
        children: formatValidChain(
          injectKey(`decorator-${key}`)(getIn(parseDecorator, ['props', 'children'])),
          injectKey(`target-${key}`)(acc),
        ),
        key,
      });
    }, component);
}

export function isReactClass(condition) {
  return condition && condition.prototype instanceof React.Component;
}

export function injectKey(key) {
  return element => (isValidElement(element) ? cloneElement(element, { key }) : element);
}

export function formatValidChain(...element) {
  return [].concat(...element).filter(Boolean);
}

/**
 * filter the kv if value is undefined
 * { a: undefined, b: null, c: false, d: 'd', f: 0 } => { b: null, c: false, d: 'd', f: 0}
 * @param {Object} object
 * @returns {Object}
 */
export function filterEmptyKey(object) {
  return (
    object &&
    Object.keys(object).reduce(
      (acc, cur) => (object[cur] !== undefined ? { ...acc, [cur]: object[cur] } : acc),
      {},
    )
  );
}

/**
 * sort arr like [f(a), {obj: b}, f(c), {obj: d}] => [{obj: b}, {obj: d}, f(a), f(c),]
 * @param {Array} chain
 * @returns {Array}
 */
export function functionHoist(chain = []) {
  return chain
    .reduce((acc, cur) => {
      const [elements = [], functions = []] = acc;
      if (typeof cur === 'function' && !isReactClass(cur)) {
        return [elements, [...functions, cur]];
      }
      return [[...elements, cur], functions];
    }, [])
    .reduce((acc, cur) => acc.concat(cur), []);
}

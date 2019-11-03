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
    const {
      '@pParams': paramChain,
      '@pDecorator': decoratorChain,
      '@props': props,
      '@wrap': wrap,
    } = params;

    let element;
    if (isReactClass(condition)) {
      // If is a React Class, Decorator
      const Component = condition;
      element = injectEnhance(decoratorChain, paramChain)(
        <Component {...props} />
      );
    } else if (typeof condition === 'function') {
      // is a function IoC
      element = condition(params);
    } else if (isValidElement(condition)) {
      // If is a React instance, Decorator
      element = injectEnhance(decoratorChain, paramChain)(
        cloneElement(condition, props)
      );
    } else if (Array.isArray(condition)) {
      // If is a Array, to classify
      element = condition.map((c, idx) => dispense(params, idx)(c));
    } else if (typeof condition === 'object' && condition !== null) {
      // If is a Object, process condition object
      element = recombineObject(condition, params);
    } else {
      // is a anthoer else
      element = condition;
    }
    console.log(wrap);
    // injectEnhance(wrap, paramChain)
    return compose(injectKey(key))(element);
  };
}

/**
 *
 * @param {Object} condition : Condition Object
 * @param {*} params : extra for inherit or decorator
 * @returns {Array} ReactElements
 */
export function recombineObject(condition = {}, params = {}) {
  const {
    '@component': component,
    '@decorator': decorator,
    '@props': props,
    '@wrap': wrap,
    ...restCondition
  } = condition;
  const {
    '@pDecorator': pDecorator,
    '@props': pProps,
    '@wrap': pWrap,
    ...restParams
  } = params;

  const decoratorChain = formatValidChain(pDecorator, decorator);
  const paramChain = filterEmptyKey({
    ...restCondition,
    ...restParams,
  });

  const propsChain = {
    ...pProps,
    ...props,
  };

  const wrapChain = formatValidChain(pWrap, wrap);

  if (
    component &&
    typeof component === 'object' &&
    !isValidElement(component)
  ) {
    const inheritChain = filterEmptyKey({
      '@pParams': paramChain,
      '@pDecorator': decoratorChain,
      '@props': propsChain,
      '@wrap': wrapChain,
    });
    return dispense(inheritChain)(component);
  }

  return compose(
    injectEnhance(decoratorChain, paramChain),
    dispense({
      ...paramChain,
      '@props': propsChain,
      '@wrap': wrapChain,
    })
  )(component);
}

/**
 * decorator to target
 * @param {Array} decorator : decoratorChain
 * @param {Object} params : all condtion chain props
 */
export function injectEnhance(injector, params) {
  return component =>
    functionHoist(injector).reduceRight((acc, cur, key) => {
      if (
        (typeof cur === 'object' && !isValidElement(cur)) ||
        Array.isArray(cur)
      ) {
        throw new Error('@injector just arrow injector or ReactElement');
      }
      // if it's a function then ioc
      if (typeof cur === 'function' && !isReactClass(cur)) {
        return injectKey(key)(cur(acc, params));
      }
      // else render and wrap it

      const parseDecorator = dispense(params)(cur);
      return cloneElement(parseDecorator, {
        children: formatValidChain(
          injectKey(`injector-${key}`)(
            getIn(parseDecorator, ['props', 'children'])
          ),
          injectKey(`target-${key}`)(acc)
        ),
        key,
      });
    }, component);
}

export function isReactClass(condition) {
  return condition && condition.prototype instanceof React.Component;
}

export function injectKey(key) {
  return element =>
    isValidElement(element) ? cloneElement(element, { key }) : element;
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
      (acc, cur) =>
        object[cur] !== undefined ? { ...acc, [cur]: object[cur] } : acc,
      {}
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

export function getConditionType(condition) {}

import React, { isValidElement, cloneElement } from "react";
import compose from "./utils/compose";

export default (condition, params) => dispense(params)(condition);

export interface Condition {
  "@params": Record<string, any>;
  "@component": React.ReactNode;
}
/**
 * parse condition And classification
 * @param {Object} params : Conditin Object , a ReactElement's description
 * @param {*} key : unicon key
 * @return {Object | Array} ReactElement | ReactElements
 */
function dispense(params = {}) {
  return (condition) => {
    const {
      "@pParams": paramChain,
      "@pDecorator": decoratorChain,
      "@props": props,
      "@wrap": wrap,
    } = params;

    switch (conditionType(condition)) {
      case "react-class": {
        // If is a React Class, Decorator
        const Component = condition;
        return injectEnhance(
          decoratorChain,
          paramChain
        )(<Component {...props} />);
      }
      case "function": {
        // is a function IoC
        return condition(params);
      }
      case "react-element": {
        // If is a React instance, Decorator
        return injectEnhance(
          decoratorChain,
          paramChain
        )(cloneElement(condition, props));
      }
      case "array": {
        // If is a Array, to classify
        return injectEnhance(
          wrap,
          paramChain
        )(
          condition.map((c, idx) =>
            compose(injectKey(idx), dispense(params))(c)
          )
        );
      }
      case "object": {
        // If is a Object, process condition object
        return recombineObject(condition, params);
      }
      default: {
        // is a anthoer else
        return condition;
      }
    }
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
    "@component": component,
    "@decorator": decorator,
    "@props": props,
    "@wrap": wrap,
    ...restCondition
  } = condition;
  const { "@pDecorator": pDecorator, "@props": pProps, ...restParams } = params;

  const decoratorChain = formatValidChain(pDecorator, decorator);
  const paramChain = filterEmptyKey({
    ...restCondition,
    ...restParams,
  });

  const propsChain = {
    ...pProps,
    ...props,
  };

  const wrapChain = formatValidChain(wrap);

  if (
    conditionType(component) === "object" ||
    conditionType(component) === "array"
  ) {
    const inheritChain = filterEmptyKey({
      "@pParams": paramChain,
      "@pDecorator": decoratorChain,
      "@props": propsChain,
      "@wrap": wrapChain,
    });
    return dispense(inheritChain)(component);
  }

  return compose(
    injectEnhance(wrapChain, paramChain),
    injectEnhance(decoratorChain, paramChain),
    dispense({
      ...paramChain,
      "@props": propsChain,
    })
  )(component);
}

/**
 * decorator to target
 * @param {Array} decorator : decoratorChain
 * @param {Object} params : all condtion chain props
 */
export function injectEnhance(injector, params) {
  return (component) =>
    functionHoist(injector).reduceRight((acc, cur, key) => {
      if (conditionType(cur) === "object" || conditionType(cur) === "array") {
        throw new Error("@injector just arrow decorator or ReactElement");
      }
      // if it's a function then ioc
      if (conditionType(cur) === "function") {
        return injectKey(key)(cur(acc, params));
      }
      // else render and wrap it

      const parseDecorator = dispense(params)(cur);
      return cloneElement(parseDecorator, {
        children: formatValidChain(
          injectKey(`injector-${key}`)(
            getIn(parseDecorator, ["props", "children"])
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
  return (element) =>
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
      return conditionType(cur) === "function"
        ? [elements, [...functions, cur]]
        : [[...elements, cur], functions];
    }, [])
    .reduce((acc, cur) => acc.concat(cur), []);
}

export function conditionType(condition) {
  if (isReactClass(condition)) {
    return "react-class";
  } else if (typeof condition === "function") {
    return "function";
  } else if (isValidElement(condition)) {
    return "react-element";
  } else if (Array.isArray(condition)) {
    return "array";
  } else if (typeof condition === "object" && condition !== null) {
    return "object";
  }
}

import React, { cloneElement } from 'react';

/**
 * 组合函数
 * @param  {fns} Functions
 * @return {HOF} Function
 */
const compose = (...fns) =>
  fns.reduceRight((prevFn, nextFn) => (...args) => nextFn(prevFn(...args)), value => value);

export default compose;
/**
 * 组合组件
 * @param  {iterable Element} [Components]
 * @return {HOC} Component
 */
export const composeComponents = (...Components) => Component =>
  Components.reduceRight((PrevComponent, NextComponent) => {
    if (typeof PrevComponent === 'function') {
      return cloneElement(NextComponent, { children: <PrevComponent /> });
    }

    if (typeof NextComponent === 'function') {
      return <NextComponent>{PrevComponent}</NextComponent>;
    }

    return cloneElement(NextComponent, { children: PrevComponent });
  }, Component);

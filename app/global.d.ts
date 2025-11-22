/// <reference types="react" />
/// <reference types="react-dom" />

// Ensure JSX namespace is available
import * as React from 'react';

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> { }
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty { props: {}; }
    interface ElementChildrenAttribute { children: {}; }
    interface IntrinsicAttributes extends React.Attributes { }
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> { }
    
    type LibraryManagedAttributes<C, P> = C extends React.ComponentType<infer T>
      ? T extends React.ComponentType<any>
        ? AugmentedComponent<T, P>
        : P
      : P;

    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

type AugmentedComponent<C, P> = C extends new (props: infer CP) => React.Component<infer _, infer _>
  ? CP extends P
    ? CP
    : P
  : never;

export {};

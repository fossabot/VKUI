/* eslint-disable */

import React, { Component, HTMLAttributes } from 'react';
import Tappable from '../Tappable/Tappable';
import PopoutWrapper from '../PopoutWrapper/PopoutWrapper';
import getClassName from '../../helpers/getClassName';
import classNames from '../../lib/classNames';
import transitionEvents from '../../lib/transitionEvents';
import { ANDROID } from '../../lib/platform';
import { HasChildren, HasPlatform } from '../../types/props';
import withPlatform from '../../hoc/withPlatform';

export interface AlertActionInterface {
  title: string;
  action?(): void;
  autoclose?: boolean;
  mode: 'cancel' | 'destructive' | 'default';
}

export interface AlertProps extends HTMLAttributes<HTMLElement>, HasPlatform, HasChildren {
  actionsLayout?: 'vertical' | 'horizontal';
  actions?: AlertActionInterface[];
  onClose?(): void;
}

export interface AlertState {
  closing: boolean;
}

class Alert extends Component<AlertProps, AlertState> {
  constructor(props) {
    super(props);
    this.element = React.createRef();
    this.state = {
      closing: false,
    };
  }

  element: React.RefObject<HTMLDivElement>;

  static defaultProps = {
    actionsLayout: 'horizontal',
    actions: [],
  };

  onItemClick = (item) => () => {
    const { action, autoclose } = item;

    if (autoclose) {
      this.setState({ closing: true });
      this.waitTransitionFinish(() => {
        autoclose && this.props.onClose();
        action && action();
      });
    } else {
      action && action();
    }
  };

  onClose = () => {
    this.setState({ closing: true });
    this.waitTransitionFinish(() => {
      this.props.onClose();
    });
  };

  stopPropagation = (e) => e.stopPropagation();

  waitTransitionFinish(eventHandler) {
    if (transitionEvents.supported) {
      const eventName = transitionEvents.prefix ? transitionEvents.prefix + 'TransitionEnd' : 'transitionend';

      this.element.current.removeEventListener(eventName, eventHandler);
      this.element.current.addEventListener(eventName, eventHandler);
    } else {
      setTimeout(eventHandler.bind(this), this.props.platform === ANDROID ? 200 : 300);
    }
  }

  render() {
    const { actions, actionsLayout, children, className, style, platform, ...restProps } = this.props;
    const { closing } = this.state;

    return (
      <PopoutWrapper
        className={className}
        closing={closing}
        style={style}
        onClick={this.onClose}
      >
        <div
          {...restProps}
          ref={this.element}
          onClick={this.stopPropagation}
          className={classNames(getClassName('Alert', platform), {
            'Alert--v': actionsLayout === 'vertical',
            'Alert--h': actionsLayout === 'horizontal',
            'Alert--closing': closing,
          })}
        >
          <div className="Alert__content">{children}</div>
          <footer className="Alert__footer">
            {actions.map((action: AlertActionInterface, i: number) =>
              <Tappable
                Component="button"
                className={classNames('Alert__btn', `Alert__btn--${action.mode}`)}
                onClick={this.onItemClick(action)}
                key={`alert-action-${i}`}
              >
                <span dangerouslySetInnerHTML={{ __html: action.title }} />
              </Tappable>
            )}
          </footer>
        </div>
      </PopoutWrapper>
    );
  }
}

export default withPlatform(Alert);
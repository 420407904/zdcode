import React, {
  FC,
  JSXElementConstructor,
  ReactElement,
  useMemo,
  useState,
} from 'react'
import classNames from 'classnames'
import { SyntaxKind } from 'typescript'
import { Tabs } from 'antd'
import { CodeOutlined, EditOutlined } from '@ant-design/icons'
import styles from './index.module.css'
import PropsEditor, { PropsOptions } from '../../propsEditor'
import Code from '../code-highlighter'

export interface IPreviewProps {
  codeSource?: string
  componentName: string
  componentPropsOptions?: PropsOptions
  children: ReactElement<any, string | JSXElementConstructor<any>>[]
  className?: string
  style?: React.CSSProperties
}

function getValue([key, value]: [string, any]) {
  if (typeof value === 'string') return `${key}="${value}"`
  if (typeof value === 'number') return `${key}={${value}}`
  if (typeof value === 'boolean') return value ? key : `${key}={${value}}`
  return `${key}={${JSON.stringify(value)}}`
}

function getComponentCode(name: string, { children, ...props }: any) {
  const propsArr = Object.entries(props).map(getValue)
  const propsStr = propsArr.length > 2 ? '\n' + propsArr.join('\n  ') : propsArr.join(' ')
  return children ? `<${name} ${propsStr}>\n  ${children || ''}\n</${name}>` : `<${name} ${propsStr} />`
}

const Preview: FC<IPreviewProps> = (params) => {
  const { className, style, children, componentName, componentPropsOptions } =
    params
  
  console.log('componentPropsOptions', componentPropsOptions);

  const defaultPorps = useMemo(() => {
    if (!componentPropsOptions) return {}
    let props: Record<string, any> = {}
    componentPropsOptions
      .filter(({ tags }) => tags.default || tags.editData)
      .forEach(({ kind, name, tags }) => {
        if (kind === SyntaxKind.BooleanKeyword) {
          props[name] = tags.default === 'true'
          return
        }
        if (tags.editType === 'json') {
          try {
            props[name] = JSON.parse(tags.default || tags.editData)
          } catch (error) {
            props[name] = tags.isArray ? [] : {}
          }
          return
        }
        props[name] = tags.default || tags.editData
      })

    return props
  }, [componentPropsOptions])

  const [props, setProps] = useState(defaultPorps)

  console.log('props', props);

  const component = children ? React.cloneElement(children[0], props) : <></>
  return (
    <div
      className={classNames(
        styles.preview,
        className,
        'border border-slate-100 dark:border-slate-500 dark:bg-slate-800'
      )}
      style={style}
    >
      <div
        className={classNames(
          styles.componentContainer,
          'border-b border-slate-100 dark:border-slate-500'
        )}
      >
        {component}
      </div>
      <Code>{getComponentCode(componentName, props)}</Code>
      {componentPropsOptions && (
        <PropsEditor
          defaultPorps={props}
          options={componentPropsOptions}
          onChangePorps={setProps}
        />
      )}
    </div>
  )
}

export default React.memo(Preview)

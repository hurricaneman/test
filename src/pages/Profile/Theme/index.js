import React from 'react'
import { Card, Input, Form, Button, Select, Switch, message, Spin } from 'antd'
import axios from 'axios'
import less from 'less'
import { session, checkres, changeTheme } from 'utils'
// import { useHead } from 'utils/hooks'
import MenuType from './MenuType'
import PageWrapper from 'components/PageWrapper'

export default function Theme() {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)
  // const headFixd = useHead()

  React.useEffect(() => {
    axios.get('/userTheme/getTheme').then(res => {
      if (!checkres(res)) return
      if (!res.data.data) return
      const { theme, head, configMap, menuType = 'TOPLEFT' } = res.data.data
      form.setFieldsValue({
        theme,
        menuType,
        head: head ? true : false,
        ...configMap,
      })
    })
  }, [])

  async function onFinish(values) {
    setLoading(true)
    const { theme, head, menuType, ...config } = values
    const res = await axios.get(`./themes/${theme}.less`, { baseURL: '' })
    await new Promise(r => setTimeout(r, 1000))
    const res0 = await less.render(res.data, {
      javascriptEnabled: true,
      modifyVars: config,
    })
    const formData = new FormData()
    formData.append('file', new Blob([res0.css]), 'style.css')
    const resCSS = await axios.post('/file/fileUpload', formData)
    if (resCSS.data.code === 500) {
      message.error('上传主题文件失败')
      setLoading(false)
      return
    }
    const css = resCSS.data.data.fileUrl
    const res1 = await axios.post('/userTheme/add', {
      userId: session.userData.userId,
      theme,
      menuType,
      head: head ? 1 : 0,
      config: JSON.stringify(config),
      css,
    })
    if (res1.data.code === 1) {
      message.success('修改主题成功')
    } else {
      message.error('修改主题失败')
    }
    console.log(values)
    changeTheme(theme, head, css, menuType)
    setLoading(false)
  }

  return (
    <>
      {/* <PageHeader
        style={
          headFixd
            ? {
                position: 'sticky',
                zIndex: 99,
                top: 0,
              }
            : {}
        }
        title="主题配置"
        ghost={false}
        breadcrumb={{
          routes: [
            { breadcrumbName: '个人设置' },
            { breadcrumbName: '主题配置' },
          ],
          itemRender: r => <span>{r.breadcrumbName}</span>,
        }}
      /> */}
      <PageWrapper>
        <Spin spinning={loading} tip="主题设置中...">
          <Card title="主题设置">
            <Form
              form={form}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              style={{ maxWidth: 430 }}
              onFinish={onFinish}
            >
              <Form.Item label="预设主题" name="theme">
                <Select>
                  <Select.Option value="default">默认主题</Select.Option>
                  <Select.Option value="dark">默认主题-深色</Select.Option>
                  <Select.Option value="aliyun">阿里云</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="全局主色" name="@primary-color">
                <Input type="color" style={{ width: 42, height: 32 }}></Input>
              </Form.Item>
              <Form.Item label="主字号" name="@font-size-base">
                <Select>
                  <Select.Option value="12px">12px</Select.Option>
                  <Select.Option value="14px">14px</Select.Option>
                  <Select.Option value="16px">16px</Select.Option>
                  <Select.Option value="18px">18px</Select.Option>
                  <Select.Option value="20px">20px</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="圆角大小" name="@border-radius-base">
                <Select>
                  <Select.Option value="0">0</Select.Option>
                  <Select.Option value="2px">2px</Select.Option>
                  <Select.Option value="4px">4px</Select.Option>
                  <Select.Option value="6px">6px</Select.Option>
                  <Select.Option value="10px">10px</Select.Option>
                  <Select.Option value="16px">16px</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="导航模式"
                name="menuType"
                valuePropName="menuType"
              >
                <MenuType />
              </Form.Item>
              <Form.Item
                label="固定 Header"
                name="head"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Spin>
      </PageWrapper>
    </>
  )
}

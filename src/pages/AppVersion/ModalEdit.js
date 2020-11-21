import React from 'react'
import { Modal, Input, Form, Radio, Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import axios from 'axios'
import { checkres, session } from 'utils'
import { SERVERDFWL } from 'configs/service'

export default function ModalEdit(props) {
  const { visible, onCancel, onOk, mode, record } = props
  const [loading, setLoading] = React.useState()
  const [fileList, setFileList] = React.useState([])
  const [form] = Form.useForm()

  React.useEffect(() => {
    if (!visible) return
    switch (mode) {
      case 'add':
        {
          form.resetFields()
          setFileList([])
        }
        break
      case 'update':
        {
          form.setFieldsValue({
            ...record,
          })
          record.annexUrl
            ? setFileList([
                {
                  uid: '1',
                  name: record.annexUrl,
                  status: 'done',
                  url: record.annexUrl,
                  response: {
                    data: record.annexUrl,
                  },
                },
              ])
            : setFileList([])
        }
        break
    }
  }, [visible])

  function onSubmit() {
    form.validateFields().then(fields => {
      setLoading(true)
      if (mode === 'update') fields.id = record.id
      // console.log(fields)
      fields.annexUrl = fields.annexUrl.fileList
        ? fields.annexUrl.fileList[0].response.data.fileUrl
        : fields.annexUrl
      if (!fields.annexUrl) {
        message.error('上传文件错误，请重新上传')
        return
      }
      axios
        .post('/edition/' + mode, { ...fields }, { baseURL: SERVERDFWL })
        .then(res => {
          setLoading(false)
          if (!checkres(res)) return
          message.success(res.data.msg)
          onCancel()
          onOk()
        })
    })
  }

  const handleChange = info => {
    let fileList = [...info.fileList]
    fileList = fileList.slice(-1)
    fileList = fileList.map(file => {
      if (file.response && file.response.code === 1 && file.response.data) {
        file.url = file.response.data.fileUrl
      } else if (file.response && file.response.code === 500) {
        file.url = null
        file.status = 'error'
      }
      return file
    })
    // console.log(fileList)
    setFileList(fileList)
  }

  return (
    <Modal
      visible={visible}
      title={mode === 'add' ? '新增' : '修改'}
      onCancel={onCancel}
      onOk={onSubmit}
      maskClosable={false}
      confirmLoading={loading}
    >
      <Form form={form} wrapperCol={{ span: 18 }} labelCol={{ span: 6 }}>
        <Form.Item
          name="appName"
          label="APP名称"
          rules={[{ required: true, message: 'APP名称为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="appfileName"
          label="APP文件名称"
          rules={[{ required: true, message: 'APP文件名称为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="editionName"
          label="版本名称"
          rules={[{ required: true, message: '版本名称为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="versionNumber"
          label="版本号"
          rules={[
            { required: true, message: '版本号为必填' },
            { pattern: /^[0-9]{1,8}$/, message: '请输入8位以内的数字' },
          ]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="applicationType"
          label="应用类型"
          rules={[{ required: true, message: '应用类型为必填' }]}
        >
          <Radio.Group>
            <Radio value={1}>IOS</Radio>
            <Radio value={0}>安卓</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="upgrade"
          label="是否必须升级"
          rules={[{ required: true, message: '是否必须升级为必填' }]}
        >
          <Radio.Group>
            <Radio value={0}>否</Radio>
            <Radio value={1}>是</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="annexUrl"
          label="上传文件"
          rules={[{ required: true, message: '上传文件为必填' }]}
        >
          <Upload
            headers={{ Authorization: session.Authorization }}
            className="avatar-uploader"
            accept=".apk,.ipa"
            showUploadList={true}
            action={`${SERVERDFWL}/file/fileUpload`}
            fileList={fileList}
            onChange={handleChange}
          >
            <Button>
              <UploadOutlined /> 上传文件
            </Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name="updateContent"
          label="更新内容"
          rules={[{ required: true, message: '更新内容为必填' }]}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  )
}

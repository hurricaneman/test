import React from 'react'
import { Form, Icon as LegacyIcon } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Input, Button, PageHeader, Upload, Card } from 'antd'
import axios from 'axios'
import { SERVER } from 'configs/service'
const { TextArea } = Input

function ModalEdit(props) {
  const {
    visible,
    onCancel,
    onOk,
    mode,
    record,
    form,
    form: { getFieldDecorator: f },
  } = props
  const [loading, setLoading] = React.useState()
  const [fileList, setFileList] = React.useState()
  React.useEffect(() => {
    if (!visible) {
      form.resetFields()
      return
    }
    const fileList = []
    if (visible && mode === 'update') {
      form.setFieldsValue({
        name: record.name,
        editionNum: record.editionNum,
        remark: record.remark,
        content: record.content,
        annexUrl: record.annexUrl ? record.annexUrl : '',
      })
      const urlList = record.annexUrl ? record.annexUrl.split(',') : []

      if (urlList.length > 0) {
        urlList.map((v, i) => {
          if (v !== '') {
            fileList.push({
              uid: i,
              name: v,
              status: 'done',
              url: v,
            })
          }
        })
      } else if (record.annexUrl) {
        fileList.push({
          uid: '1',
          name: record.annexUrl,
          status: 'done',
          url: record.annexUrl,
        })
      }
    }
    console.log(fileList)
    setFileList(fileList)
  }, [visible])
  const onRemove = file => {
    console.log(file)
    setFileList(file.fileList)
  }
  const onchangeFile = file => {
    if (
      mode === 'update' &&
      file.file.response &&
      file.file.response.code == 1
    ) {
      record.annexUrl += ',' + file.file.response.data.fileName
    }
    console.log(file)
    setFileList([
      {
        name: file.file.name,
        uid: file.fileList.length,
        status: 'done',
        // url: record.annexUrl,
      },
    ])
  }
  function onSubmit() {
    form.validateFields(async (err, fields) => {
      if (err) return
      setLoading(true)
      if (mode === 'update') {
        fields.agreementId = record.agreementId
      }
      fields.annexUrl = ''
      fileList.map(v => {
        fields.annexUrl += v.name + ','
      })
      await axios.post(`/agreementEdition/${mode}/`, {
        ...fields,
      })
      setLoading(false)
      onOk()
    })
  }

  return (
    <>
      <PageHeader title={mode === 'add' ? '新增' : '修改'} />

      <Card bordered={false}>
        <Form
          layout="horizontal"
          wrapperCol={{ span: 12 }}
          labelCol={{ span: 3 }}
        >
          <Form.Item label="协议名称" style={{ marginBottom: 10 }}>
            {f('name', {
              rules: [{ required: true, message: '协议名称必填' }],
            })(<Input type="text" maxLength="50" />)}
          </Form.Item>
          <Form.Item label="版本号" style={{ marginBottom: 10 }}>
            {f('editionNum', {
              rules: [{ required: true, message: '版本号必填' }],
            })(<Input type="text" maxLength="50" />)}
          </Form.Item>
          <Form.Item label="协议内容">
            {f('content', {
              rules: [{ required: false, message: '协议内容' }],
            })(<TextArea maxLength="100" rows={4} />)}
          </Form.Item>
          <Form.Item label="备注">
            {f('remark', {
              rules: [{ required: false, message: '备注' }],
            })(<TextArea maxLength="100" rows={4} />)}
          </Form.Item>
          {/* <Form.Item label="文件列表">
          {record.annexUrl.split(',').map(v => (
            <a href={v} key={v}>
              {v}
            </a>
          ))}
        </Form.Item> */}
          <Form.Item label="文件上传">
            <Upload
              action={SERVER + '/file/fileUpload'}
              fileList={fileList}
              onRemove={onRemove}
              onChange={onchangeFile}
            >
              <Button>
                <LegacyIcon type="upload" /> Upload
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Card>
      <Card
        bordered={false}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          transition: 'all 0.3s ease 0s',
          borderTop: '1px solid #e8e8e8',
          boxShadow: '0 -1px 2px rgba(0,0,0,.03)',
        }}
      >
        <Button
          onClick={() => {
            onCancel()
          }}
        >
          取消
        </Button>
        <Button
          style={{ marginLeft: 15 }}
          type="primary"
          loading={loading}
          onClick={() => {
            onSubmit()
          }}
        >
          提交
        </Button>
      </Card>
    </>
  )
}

export default Form.create()(ModalEdit)

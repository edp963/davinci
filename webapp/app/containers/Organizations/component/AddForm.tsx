import React, { useMemo, useCallback, useImperativeHandle } from 'react'
import { useSelector } from 'react-redux'
import classnames from 'classnames'
import debounce from 'lodash/debounce'
import { Button, Form, Icon, Checkbox, Select, Spin } from 'antd'
const Option = Select.Option
import { WrappedFormUtils, FormComponentProps } from 'antd/lib/form/Form'
const FormItem = Form.Item
const styles = require('../Team.less')
import { IInviteMemberProps } from '../types'
import { uuid } from 'utils/util'
import { makeSelectInviteMemberLoading } from '../selectors'

const AddForm: React.FC<IInviteMemberProps & FormComponentProps> = (
  {
    form,
    category,
    addHandler,
    inviteMemberList,
    organizationDetail,
    handleSearchMember
  },
  ref
) => {
  useImperativeHandle(ref, () => ({ ...form }))
  const fetching = useSelector(makeSelectInviteMemberLoading())

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      if (searchValue && searchValue.length) {
        handleSearchMember(searchValue)
      }
    }, 1000),
    [handleSearchMember]
  )

  const submit = useCallback(() => {
    if (addHandler) {
      addHandler()
    }
  }, [addHandler])

  const getOptions = useMemo(() => {
    return inviteMemberList && inviteMemberList.length
      ? inviteMemberList.slice(0, 20).map((d) => (
          <Option key={`${uuid}${d.username}`} value={d.id}>
            <div className={styles.options}>
              <strong>{d.username}</strong>
              <span className={styles.email}>{d.email}</span>
            </div>
          </Option>
        ))
      : []
  }, [inviteMemberList])

  const { getFieldDecorator } = form
  return (
    <div className={styles.addFormWrapper}>
      <div className={styles.titleWrapper}>
        <div className={styles.icon}>
          <Icon type="user" />
        </div>
        <div className={styles.title}>
          添加{category}到
          <span className={styles.orgName}>{organizationDetail?.name}</span>
        </div>
      </div>
      <div className={styles.search}>
        <Form>
          <Form.Item>
            {getFieldDecorator(
              'members'
            )(
              <Select
                mode="multiple"
                showSearch
                filterOption={false}
                onSearch={debouncedSearch}
                notFoundContent={fetching ? <Spin size="small" /> : null}
              >
                {getOptions}
              </Select>
            )}
          </Form.Item>
          <FormItem>
            {getFieldDecorator(
              'needEmail',
              {
                initialValue: true,
                valuePropName: 'checked'
              }
            )(<Checkbox>需要被邀请成员邮件确认</Checkbox>)}
          </FormItem>
        </Form>
      </div>
      <div className={styles.submit}>
        <Button type="primary" onClick={submit}>
          邀请
        </Button>
      </div>
    </div>
  )
}

export default Form.create<IInviteMemberProps & FormComponentProps>()(
  React.forwardRef<WrappedFormUtils>(AddForm)
)

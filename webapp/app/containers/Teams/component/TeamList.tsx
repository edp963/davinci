import * as React from 'react'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Button = require('antd/lib/button')
const Input = require('antd/lib/input')
const Select = require('antd/lib/select')
const Table = require('antd/lib/table')
const Icon = require('antd/lib/icon')
const styles = require('../Team.less')

export class TeamList extends React.PureComponent {
  private onSearchTeam = () => {

  }
  private showTeamForm = () => {

  }
  public render () {
    const addButton =  (
      <Tooltip placement="bottom" title="新增">
        <Button
          size="large"
          type="primary"
          icon="plus"
          onClick={this.showTeamForm('add')}
        />
      </Tooltip>
    )

    const columns = [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
    }, {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: '30%',
    }, {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    }];

    const data = [{
      key: 1,
      name: 'John Brown sr.',
      age: 60,
      address: 'New York No. 1 Lake Park',
      children: [{
        key: 11,
        name: 'John Brown',
        age: 42,
        address: 'New York No. 2 Lake Park',
      }, {
        key: 12,
        name: 'John Brown jr.',
        age: 30,
        address: 'New York No. 3 Lake Park',
        children: [{
          key: 121,
          name: 'Jimmy Brown',
          age: 16,
          address: 'New York No. 3 Lake Park',
        }],
      }, {
        key: 13,
        name: 'Jim Green sr.',
        age: 72,
        address: 'London No. 1 Lake Park',
        children: [{
          key: 131,
          name: 'Jim Green',
          age: 42,
          address: 'London No. 2 Lake Park',
          children: [{
            key: 1311,
            name: 'Jim Green jr.',
            age: 25,
            address: 'London No. 3 Lake Park',
          }, {
            key: 1312,
            name: 'Jimmy Green sr.',
            age: 18,
            address: 'London No. 4 Lake Park',
          }],
        }],
      }],
    }, {
      key: 2,
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    }];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      onSelect: (record, selected, selectedRows) => {
        console.log(record, selected, selectedRows);
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        console.log(selected, selectedRows, changeRows);
      },
    };

    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={16}>
            <Input.Search
              size="large"
              placeholder="placeholder"
              onSearch={this.onSearchTeam}
            />
          </Col>
          <Col span={1} offset={7}>
            {addButton}
          </Col>
        </Row>
        <Row>
          <div className={styles.tableWrap}>
            <Table
              bordered
              columns={columns}
              //  rowSelection={rowSelection}
              dataSource={data}
            />
          </div>
        </Row>
      </div>
    )
  }
}

export default TeamList




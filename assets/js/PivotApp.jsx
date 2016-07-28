const React = require('react');
const $ = require('jquery');
const Cookie = require('js-cookie');
const DataField = require('./DataField');
const FieldBank = require('./FieldBank');
const MainTable = require('./MainTable');
const PivotField = require('./PivotField');

class PivotApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataFields: [],
      pivotFields: [],
      fieldTypes: [],
      default_aggregate_field_type: 0,
    };
    this.setState = this.setState.bind(this);
    this.newFieldName = this.newFieldName.bind(this);
    this.addDataField = this.addDataField.bind(this);
    this.addPivotField = this.addPivotField.bind(this);
    this.deleteDataField = this.deleteDataField.bind(this);
    this.deletePivotField = this.deletePivotField.bind(this);
    this.fieldTypeName = this.fieldTypeName.bind(this);
    this.activeName = this.activeName.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.removeRelatedPivotFields = this.removeRelatedPivotFields.bind(this);
  }

  componentDidMount() {
    const source = `/script_builder/mungers/${this.props.mungerId}?format=json`;
    this.serverRequest = $.get(source, result => this.onMount(result));
    console.log(this.state.dataFields);
  }

  componentWillUnmount() {
    this.serverRequest.abort();
  }

  onMount(result) {
    this.setState({ dataFields: result.data_fields });
    this.setState({ pivotFields: result.pivot_fields });
    this.setState({ fieldTypes: result.field_types });
    this.setState({ default_aggregate_field_type: result.default_aggregate_field_type });
  }

  handleNameChange(dataFieldId, activeName) {
    this.state.dataFields.map(dataField => {
      if (dataField.id === dataFieldId) {
        dataField.active_name = activeName;
      }
      return dataField;
    });
    this.setState({ dataFields: this.state.dataFields });
  }

  newFieldName() {
    // TODO Redux - Will not update if fields have changed without reloading
    let numNewFields = this.state.dataFields.filter(item =>
      item.active_name.startsWith('New Field')
    ).length;
    if (numNewFields > 0) {
      numNewFields += 1;
      return `New Field ${numNewFields}`;
    }
    return 'New Field';
  }

  addDataField() {
    console.log('add data field');
    const newDataField = {
      munger_builder: this.props.mungerId,
      current_name: this.newFieldName(),
    };
    $.ajax({
      beforeSend(jqXHR) {
        jqXHR.setRequestHeader('x-csrftoken', Cookie.get('csrftoken'));
      },
      type: 'POST',
      url: '/script_builder/data_fields/',
      data: newDataField,
      success: data => {
        this.setState({ dataFields: this.state.dataFields.concat([data]) });
      },
    });
  }

  addPivotField(dataFieldId, fieldTypeId) {
    console.log('add pivot field');
    const newPivotField = {
      data_field: dataFieldId,
      field_type: fieldTypeId || this.state.default_aggregate_field_type,
    };
    $.ajax({
      beforeSend(jqXHR) {
        jqXHR.setRequestHeader('x-csrftoken', Cookie.get('csrftoken'));
      },
      type: 'POST',
      url: '/script_builder/pivot_fields/',
      data: newPivotField,
      success: data => {
        this.setState({ pivotFields: this.state.pivotFields.concat([data]) });
        console.log(data);
      },
    });
  }

  deleteDataField(dataFieldId) {
    console.log('delete');
    const dataFields = this.state.dataFields;
    const deleteIndex = dataFields.findIndex(f => f.id === dataFieldId);
    dataFields.splice(deleteIndex, 1);
    $.ajax({
      beforeSend(jqXHR) {
        jqXHR.setRequestHeader('x-csrftoken', Cookie.get('csrftoken'));
      },
      type: 'DELETE',
      url: `/script_builder/data_fields/${dataFieldId}`,
      success: this.setState({ dataFields }),
    });
    this.removeRelatedPivotFields(dataFieldId);
  }

  removeRelatedPivotFields(dataFieldId) {
    const fieldsToRemove = this.state.pivotFields.filter(pivotField =>
      pivotField.data_field === dataFieldId
    );
    const pivotFields = this.state.pivotFields;
    fieldsToRemove.forEach(removeField => {
      pivotFields.splice(pivotFields.findIndex(f => f.id === removeField.id), 1);
    });
    this.setState({ pivotFields });
  }

  deletePivotField(pivotFieldId) {
    console.log('delete');
    const pivotFields = this.state.pivotFields;
    const deleteIndex = pivotFields.findIndex(f => f.id === pivotFieldId);
    pivotFields.splice(deleteIndex, 1);
    $.ajax({
      beforeSend(jqXHR) {
        jqXHR.setRequestHeader('x-csrftoken', Cookie.get('csrftoken'));
      },
      type: 'DELETE',
      url: `/script_builder/pivot_fields/${pivotFieldId}`,
      success: this.setState({ pivotFields }),
    });
  }

  fieldTypeName(fieldTypeId) {
    const fieldTypeMap = {};
    this.state.fieldTypes.map(fieldType => {
      fieldTypeMap[fieldType.id] = fieldType.type_name;
      return fieldTypeMap;
    });
    return fieldTypeMap[fieldTypeId];
  }

  activeName(dataFieldId) {
    const activeNameMap = {};
    this.state.dataFields.map(dataField => {
      activeNameMap[dataField.id] = dataField.active_name;
      return activeNameMap;
    });
    return activeNameMap[dataFieldId];
  }

  render() {
    return (
      <div className="pivot-app">
        <FieldBank addDataField={this.addDataField}>
          {this.state.dataFields.map(dataField =>
            <DataField
              key={dataField.id}
              deleteDataField={this.deleteDataField}
              addPivotField={this.addPivotField}
              handleNameChange={this.handleNameChange}
              {...dataField}
            />
          )}
        </FieldBank>
        <MainTable>
          {this.state.pivotFields.map(pivotField =>
            <PivotField
              key={pivotField.id}
              deletePivotField={this.deletePivotField}
              fieldTypeName={this.fieldTypeName}
              activeName={this.activeName}
              {...pivotField}
            />
          )}
        </MainTable>
      </div>
    );
  }
}


PivotApp.propTypes = {
  mungerId: React.PropTypes.number.isRequired,
};
module.exports = PivotApp;

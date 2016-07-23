const React = require('react');
const $ = require('jquery');
const Cookie = require('js-cookie');
const BaseField = require('./BaseField');
const Button = require('./Button');

class FieldBank extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      editing: false,
    };
  }

  componentDidMount() {
    const source = `/script_builder/munger/${this.props.mungerId}/fields?format=json`;
    this.serverRequest = $.get(source, result =>
      this.setState({ fields: result }).bind(this)
    );
  }

  componentWillUnmount() {
    this.serverRequest.abort();
  }

  addField() {
    const field = {
      munger_builder: this.props.mungerId,
      current_name: this.newFieldName(),
    };
    const fields = this.state.fields;
    $.ajax({
      beforeSend(jqXHR) {
        jqXHR.setRequestHeader('x-csrftoken', Cookie.get('csrftoken'));
      },
      type: 'POST',
      url: '/script_builder/field/create',
      data: field,
      success: data => {
        fields.push(data);
        this.setState({ fields: fields }).bind(this);
      },
    });
  }

  newFieldName() {
    // TODO Will not update if fields have changed without reloading
    let numNewFields = this.state.fields.filter(item =>
      item.active_name.startsWith('New Field')
    ).length;
    if (numNewFields > 0) {
      numNewFields += 1;
      return `New Field ${numNewFields}`;
    }
    return 'New Field';
  }

  deleteField(fieldID) {
    const fields = this.state.fields;
    // fields.forEach(function(entry) {
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].id === fieldID) {
        fields.splice(i, 1);
        break;
      }
    }

    console.log('delete');
    $.ajax({
      beforeSend(jqXHR) {
        jqXHR.setRequestHeader('x-csrftoken', Cookie.get('csrftoken'));
      },
      type: 'DELETE',
      url: `/script_builder/field/${fieldID}`
    })
    this.setState({ fields: fields });
  }

  render() {
    const deleteField = this.deleteField;
    return (
      <div>
        <div>
          {this.state.fields.map(field =>
            <BaseField deleteField={deleteField} key={field.id} field={field} />
          )}
        </div>
        <div
          className="add-field-button-container"
        >
          <Button
            type="submit"
            src=""
            value="+"
            className="btn btn-primary"
            callback={this.addField}
          />
        </div>
      </div>
    );
  }
}

FieldBank.propTypes = {
  fields: React.PropTypes.array,
  mungerId: React.PropTypes.number.isRequired,
};
module.exports = FieldBank;

const React = require('react');
const $ = require('jquery');
const Cookie = require('js-cookie');
const Button = require('./Button');
import { setActiveName } from './actions'

class DataField extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      munger_builder: this.props.munger_builder,
      current_name: this.props.current_name,
      new_name: this.props.new_name,
      active_name: this.props.active_name,
      editing: false,
      active: false,
    };
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.placeField = this.placeField.bind(this);
    this.enableEditing = this.enableEditing.bind(this);
    this.disableEditing = this.disableEditing.bind(this);
    this.saveDataField = this.saveDataField.bind(this);
  }

  onChange(e) {
    this.setState({ active_name: e.target.value });
    console.log(this);
    this.context.dispatch(setActiveName(this.props.id, e.target.value));
  }

  onClick(e) {
    const notButton = e.target.value !== 'edit' && e.target.value !== 'delete';
    if (notButton && e.currentTarget.id === this.elementID() && !this.state.editing) {
      this.setState({ active: true });
      console.log('active');
      document.body.addEventListener('click', this.placeField);
    }
    // if e.target.id !== this.elementID() && this.state.editing
  }

  placeField(e) {
    document.body.removeEventListener('click', this.placeField);
    this.setState({ active: false });
    console.log('data field inactive');
    if (e.target.parentNode.classList.contains('dropzone')) {
      this.props.addPivotField(this.props.id, null);
      console.log('pivot field created');
    }
  }

  elementID() { return `base-field-${this.props.id}`; }

  inputID() { return `field-name-input-${this.props.id}`; }

  enableEditing() {
    // set your contenteditable field into editing mode.
    console.log('editing');
    this.setState({ editing: true });
    document.body.addEventListener('keypress', this.disableEditing);
    document.body.addEventListener('click', this.disableEditing);
  }

  disableEditing(e) {
    if (e.target.id !== this.inputID() || e.key === 'Enter') {
      console.log('not editing');
      this.setState({ editing: false });
      document.body.removeEventListener('click', this.disableEditing);
      document.body.removeEventListener('keypress', this.disableEditing);
      this.saveDataField();
      e.preventDefault();
    }
  }

  saveDataField() {
    if (this.state.active_name !== this.state.new_name) {
      this.state.new_name = this.state.active_name;
      $.ajax({
        beforeSend(jqXHR) {
          jqXHR.setRequestHeader('x-csrftoken', Cookie.get('csrftoken'));
        },
        type: 'PUT',
        url: `/script_builder/data_fields/${this.props.id}`,
        data: this.state,
      });
    }
  }

  render() {
    let fieldStyle = {
      backgroundColor: this.state.active ? '#008000' : '#29e',
    };

    return (
      <div
        id={this.elementID()}
        key={this.props.id}
        style={fieldStyle}
        type="None"
        className="list-group-item"
        onClick={this.onClick}
      >
        <Button
          type="image"
          src="/static/delete-icon-transparent.png"
          value="delete"
          className="delete-field-button"
          onClick={() => this.props.deleteDataField(this.props.id)}
        />
        <div
          className="field-text"
        >
          <input
            id={this.inputID()}
            type="text"
            disabled={!this.state.editing}
            value={this.state.active_name}
            className="field-name-input"
            onChange={this.onChange}
          />
          <Button
            type="image"
            src="/static/edit-icon.png"
            value="edit"
            className="small-image-button"
            onClick={this.enableEditing}
          />
        </div>
      </div>
    );
  }
}

// const mapStateToProps = (state) => {
//   return {
//     dataFieldId: state.id,
//     activeName: state.active_name,
//   };
// };
// const mapDispatchToProps = (dispatch, ownProps) => {
//   return {
//     onClick: () => {
//       dispatch(setVisibilityFilter(ownProps.filter))
//     }
//   }
// }


DataField.propTypes = {
  store: React.PropTypes.object,
  id: React.PropTypes.number.isRequired,
  munger_builder: React.PropTypes.number.isRequired,
  current_name: React.PropTypes.string.isRequired,
  new_name: React.PropTypes.string,
  active_name: React.PropTypes.string.isRequired,
  deleteDataField: React.PropTypes.func.isRequired,
  addPivotField: React.PropTypes.func.isRequired,
};
module.exports = DataField;

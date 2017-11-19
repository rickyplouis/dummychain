import { Component } from 'react';
import io from 'socket.io-client';
import Router from 'next/router';
import PageContainer from '../components/pageContainer';
import { Form, Button, Header, Checkbox } from 'semantic-ui-react';

const uuidv1 = require('uuid/v1');

export default class MakeRoom extends Component {
  // fetch old messages data from the server

  static defaultProps = {
    rooms: []
  }

  constructor(props){
    super(props);
    this.state = {
      rooms: this.props.rooms,
      currencyName: '',
      agenda: []
    }

    this.handleForm = this.handleForm.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // connect to WS server and listen event
  componentDidMount () {
    this.socket = io()
    this.socket.on('makeRoom', this.loadRooms)
  }

  // close socket connection
  componentWillUnmount () {
    this.socket.off('makeRoom', this.loadRooms)
    this.socket.close()
  }

  // add messages from server to the state
  loadRooms = (room) => {
    this.setState(state => ({ rooms: state.rooms.concat(room) }))
  }

  //Form Handlers
  handleForm = event => {
    this.setState({ [event.target.name]: event.target.value })
  }

  makeRoom(roomID){
    return {
      id: roomID,
      createdAt: new Date(),
      currencyName: this.state.currencyName,
      agenda: this.state.agenda,
    }
  }

  handleSubmit = event => {
    event.preventDefault()
    let roomID = uuidv1();

    let room = this.makeRoom(roomID)

    this.setState(state => ({
      rooms: state.rooms.concat(this.makeRoom(room))
    }))

    Router.push({
      pathname: '/rooms',
      query: { id: roomID }
    })

    // send object to WS server
    this.socket.emit('makeRoom', room)
  }

  disableSubmit(){
    return this.state.currencyName.length === 0;
  }

  render () {
    return (
      <PageContainer>
          <Form onSubmit={this.handleSubmit} style={{marginTop: '10vh', marginLeft: '30vw', marginRight:'30vw'}}>
            <Header as="h2">Make A Room</Header>
            <Form.Field style={{textAlign:'left'}}>
              <label>Enter The Name of Your Currency</label>
              <Form.Input
                onChange={this.handleForm}
                type='text'
                placeholder='The best room'
                name="currencyName"
                value={this.state.currencyName}
                />
            </Form.Field>
            <Form.Field>
              <Button disabled={this.disableSubmit()} style={{width: '20vw'}}>Create Currency</Button>
            </Form.Field>
        </Form>
      </PageContainer>
    )
  }
}

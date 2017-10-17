import { Component } from 'react'
import io from 'socket.io-client'
import fetch from 'isomorphic-fetch'

import Link from 'next/link';

class HomePage extends Component {
  // fetch old messages data from the server
  static async getInitialProps ({ req }) {
    const appUrl = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/messages' : 'https://robertrules.io/messages';
    const response = await fetch(appUrl)
    const rooms = await response.json()
    return { rooms }
  }

  static defaultProps = {
    rooms: []
  }

  constructor(props){
    super(props);
    this.state = {
      rooms: this.props.rooms,
      inputName: '',
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // connect to WS server and listen event
  componentDidMount () {
    this.socket = io()
    this.socket.on('message', this.handleMessage)
  }

  // close socket connection
  componentWillUnmount () {
    this.socket.off('message', this.handleMessage)
    this.socket.close()
  }

  // add messages from server to the state
  handleMessage = (room) => {
    this.setState(state => ({ rooms: state.rooms.concat(room) }))
  }

  handleChange = event => {
    this.setState({ inputName: event.target.value })
  }

  // send messages to server and add them to the state
  handleSubmit = event => {
    event.preventDefault()

    const agendaItems = {
      title: "",
      message: {
        speaker: '',
        description: '',
        duration: '',
        startTime: ''
      }
    }

    console.log('this.state.inputName', this.state.inputName);
    // create message object
    const room = {
      id: (new Date()).getTime(),
      value: this.state.inputName,
      admin: '',
      agenda: [] //array of agendaItems
    }

    // send object to WS server
    this.socket.emit('message', room)

    // add it to state and clean current input value
    this.setState(state => ({
      rooms: state.rooms.concat(room)
    }))
  }

  disableSubmit(){
    return this.state.inputName.length == 0;
  }

  render () {
    return (
      <main>
        <div>
          <ul>
            {this.state.rooms.map(room =>
              <li key={room.id}>{room.value}</li>
            )}
          </ul>
          <form onSubmit={this.handleSubmit}>
            <input
              onChange={this.handleChange}
              type='text'
              placeholder='Enter Your Name'
              value={this.state.inputName}
            />
          <button disabled={this.disableSubmit()}>Send</button>
          </form>
        </div>
      </main>
    )
  }
}

export default HomePage

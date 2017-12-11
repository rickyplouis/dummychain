import React from 'react'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

import PageContainer from '../components/pageContainer'

import { Header, Form, Button, Input, Label, Progress } from 'semantic-ui-react'
import Head from 'next/head';
import { Tree } from '@vx/hierarchy';
import { hierarchy, stratify } from 'd3-hierarchy';
import { LinearGradient } from '@vx/gradient';
import * as Block from '../components/block'
import * as Controller from '../controllers/chainController'

import User from '../components/user'
import UserContainer from '../components/userContainer'

const uuidv1 = require('uuid/v1');

const MineButton = (props) => <Button onClick={props.onClick}>Begin Mining</Button>

// when calling this use onClick => this.stopTimer
const stopButton = (props) => <Button onClick={props.onClick}>Stop Mining</Button>
const JoinText = () => <Header as="h2"> Enter your name to join</Header>

export default class ChainPage extends React.Component {

  componentWillReceiveProps(nextProps) {
    const { pathname, query } = nextProps.url
    // fetch data based on the new query
  }

  static async getInitialProps ({ query: { id } }) {
    const appUrl = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/chains' : 'https://learnthechain.com/chains';
    const response = await fetch(appUrl)
    const chains = await response.json()
    return { chains }
  }

  static defaultProps = {
    chains: []
  }

  // connect to WS server and listen event
  componentDidMount () {
    this.socket = io()
    this.socket.on('updateChain', this.loadChains)
  }


  // close socket connection
  componentWillUnmount () {
    this.socket.off('updateChain', this.loadChains)
    this.socket.close()
  }

  // only update chain if id matches
  // prevents cross chain updates
  loadChains = (chain) => {
    if (chain.id == this.state.id){
      this.setState(state => ({ chain }))
    }
    return;
  }

  constructor(props){
    super(props);
    let targetChain = {}
    for (let chain of this.props.chains){
      if (chain.id === this.props.url.query.id){
        targetChain = chain;
      }
    }
    this.state = {
      chain: targetChain,
      id: this.props.url.query.id,
      username: '',
      userConnected: false,
    }
    this.increment = this.increment.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
  }

  updateChain = (e) => {
    e.preventDefault;
    this.socket.emit('updateChain', this.state.chain)
  }

  handlechainName = (event) => {
    event.preventDefault();
    this.setState({
      ...this.state,
      chain: {
        ...this.state.chain,
        chainName: event.target.value
      }
    })
    this.socket.emit('updateChain', this.state.chain)
  }

  handleUsername = (event) => {
    event.preventDefault();
    this.setState({
      ...this.state,
      username: event.target.value
    })
  }

  renderTree = () => {
    return (<svg width={'80vw'} height={'100vh'}>
          <LinearGradient id="lg" from="#fd9b93" to="#fe6e9e" />
          <rect
            width={'80vw'}
            height={'100vh'}
            rx={14}
            fill="#272b4d"
          />
          <Tree
            top={10}
            left={30}
            root={Controller.convertToTree(this.state.chain.tree)}
            size={[
              800,
              1000
            ]}
            nodeComponent={Block.Node}
            linkComponent={Block.Link}
          />
        </svg>
      )
  }


  // chain => this.state.chain
  addNode = (chain) => {
    this.setState({
      ...this.state,
      chain: {
        tree: Controller.makeNewTree(chain),
        ...this.state.chain
      }
    })
    this.socket.emit('updateChain', this.state.chain)
  }

  renderUsers = () => {
    return this.state.chain.users.map( (user) => <User name={user.username}/>)
  }

  changeTimerPercent = (percent) => {
    this.setState({
      ...this.state,
      chain: {
        ...this.state.chain,
        timer: {
          ...this.state.chain.timer,
          percent
        }
      }
    })
    this.socket.emit('updateChain', this.state.chain)
  }

  changeTimerStatus = (isRunning) => {
    this.setState({
      ...this.state,
      timer: {
        ...this.state.chain.timer,
        isRunning
      }
    })
  }

  increment = () => {
    if (this.state.chain.timer.percent >= 100){
      this.addNode(this.state.chain)
      this.changeTimerPercent(0)
    } else {
      this.changeTimerPercent(this.state.chain.timer.percent + this.state.chain.users.length)
    }
  }

  startTimer = () => {
//    this.changeTimerStatus(true);
    this.setState({
      ...this.state,
      chain: {
        ...this.state.chain,
        timer: {
          ...this.state.chain.timer,
          isRunning: true,
          intervalId: setInterval(this.increment.bind(this), 1000)
        }
      }
    }, () => {
      this.intervalId = this.state.chain.timer.intervalId
      console.log('startTimer::intervalId', this.intervalId);
      this.socket.emit('updateChain', this.state.chain)
    })
  }

  stopTimer = () => {
//    this.changeTimerStatus(false);
    this.setState({
      ...this.state,
      chain: {
        ...this.state.chain,
        timer: {
          ...this.state.chain.timer,
          isRunning: false,
          intervalId: clearInterval(this.intervalId)
        }
      }
    }, () => {
      clearInterval(this.intervalId)
      console.log('stopTimer::intervalId', this.intervalId);
      this.socket.emit('updateChain', this.state.chain)
    })
  }



  //TODO: Replace currently mining with stop mining button down the road
  renderTimerButtons = () => {
    return !this.state.chain.timer.isRunning ? <MineButton onClick={this.startTimer} /> : <div>Currently Mining.</div>
  }


  renderChain = () => {
      return (
        <div style={{margin: '0 auto', display: 'table'}}>
          <Header as="h2">In Chain {this.state.chain.chainName}</Header>
          <Progress percent={this.state.chain.timer.percent} indicating label="Mining Block" />
          {this.renderTimerButtons()}
          <div style={{width: '100vw', height: '100vh', display: 'flex'}}>
            <div style={{width: '80vw', height: '100vh'}}>
              {this.renderTree()}
            </div>
            <UserContainer>
              {this.renderUsers()}
            </UserContainer>
          </div>
        </div>
      )
  }

  connectUser = () => {
    let users = this.state.chain.users;
    users.push({ id: uuidv1(), username: this.state.username})
    this.setState({
      ...this.state,
      userConnected: true,
      chain: {
        users,
        ...this.state.chain
      }
    })
    this.socket.emit('updateChain', this.state.chain)
  }

  submitEntranceForm = (e) => {
    e.preventDefault();
    this.connectUser()
  }

  disableEntranceButton = () => {
    return this.state.username.length === 0;
  }

  renderEntranceForm(){
    return (
      <div style={{margin: '0 auto', display: 'table'}}>
        <JoinText/>
        <Form size={'tiny'} onSubmit={(e) => this.submitEntranceForm(e)} >
          <Form.Group>
            <Form.Input placeholder='Enter your name' name='name' value={this.state.username} onChange={ (e) => this.handleUsername(e)} />
            <Form.Button content='Submit' disabled={this.disableEntranceButton()} />
          </Form.Group>
        </Form>
      </div>
    )
  }

  renderPage (){
    if (Controller.chainIsEmpty(this.state.chain)){
      return <div>No chain available at this id</div>
    }
    else {
      return this.state.userConnected ? <div>{this.renderChain()}</div> : <div>{this.renderEntranceForm()}</div>
    }
  }

  render(){
    return(
      <div style={{width: '100vw', height: '100vh', textAlign: 'center'}}>
        <Head>
          <link rel='stylesheet' href='//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.2/semantic.min.css'/>
        </Head>
        {this.renderPage()}
      </div>
    )
  }
}

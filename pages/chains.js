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

const uuidv1 = require('uuid/v1');

export default class ChainPage extends React.Component {

  componentWillReceiveProps(nextProps) {
    const { pathname, query } = nextProps.url
    // fetch data based on the new query
  }

  static async getInitialProps ({ query: { id } }) {
    const appUrl = process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/chains' : 'https://robertrules.io/chains';
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
      timer: {
        percent: 0,
        isRunning: false
      }
    }

    this.intervalId = null;
    this.increment = this.increment.bind(this);
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
      username: event.target.value
    })
  }

  chainIsEmpty = (chain) => {
    return Object.keys(chain).length === 0 && chain.constructor === Object
  }

  convertToTree = (array) => {
    return hierarchy(stratify().id(function(d) { return d.hash; }).parentId(function(d) { return d.parent; })(array));
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
            root={this.convertToTree(this.state.chain.tree)}
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

  logChain = (e) => {
    e.preventDefault();
    console.log('this.state.chain.tree', this.state.chain.tree);
  }

  findDeepestBlock = () => {
    for (let x = this.state.chain.tree.length - 1; x > -1; x--){
      if (this.state.chain.tree[x].type === 'block'){
        return this.state.chain.tree[x]
      }
    }
  }


  makeBlock = (deepestBlock, type, name) => {
    return {
      name: name,
      type: type,
      parent: deepestBlock.hash,
      hash: uuidv1()
    }
  }

  addNode = () => {
    let tree = this.state.chain.tree,
        deepestBlock = this.findDeepestBlock(),
        newBlock = this.makeBlock(deepestBlock, 'block', 'block' + parseInt(Math.random() * 1000))

    tree.push(newBlock);
    for (let user of this.state.chain.users){
      tree.push(this.makeBlock(newBlock, 'user', user.username))
    }

    this.setState({
      ...this.state,
      chain: {
        tree,
        ...this.state.chain
      }
    })
    this.socket.emit('updateChain', this.state.chain)
  }

  renderUsers = () => {
    return this.state.chain.users.map( (user) => <Header as="h3" color="purple">{user.username}</Header>)
  }

  changeTimerPercent = (percent) => {
    this.setState({
      ...this.state,
      timer: {
        ...this.state.timer,
        percent
      }
    })
  }

  changeTimerStatus = (isRunning) => {
    this.setState({
      ...this.state,
      timer: {
        ...this.state.timer,
        isRunning
      }
    })
  }

  increment = () => {
    if (this.state.timer.percent >= 100){
      this.addNode()
      this.changeTimerPercent(0)
    } else {
      this.changeTimerPercent(this.state.timer.percent + 10)
    }
  }

  startTimer = () => {
    this.changeTimerStatus(true);
    this.intervalId = setInterval(this.increment.bind(this), 1000);
  }

  stopTimer = () => {
    this.changeTimerStatus(false);
    clearInterval(this.intervalId);
  }

  renderTimerButtons = () => {
    return !this.state.timer.isRunning ? <Button onClick={this.startTimer}>Begin Mining</Button> : <Button onClick={this.stopTimer}>Stop Mining</Button>
  }

  renderChain = () => {
      return (
        <div style={{margin: '0 auto', display: 'table'}}>
          <Header as="h2">In Chain {this.state.chain.chainName}</Header>
          <Progress percent={this.state.timer.percent} indicating label="Mining Block" />
          {this.renderTimerButtons()}
          <Form>
            <Form.Button content="Log Chain" onClick={(e) => this.logChain(e)}/>
            <Form.Button content="Add Node" onClick={(e) => this.addNode(e)}/>
          </Form>
          <div style={{width: '100vw', height: '100vh', display: 'flex'}}>
            <div style={{width: '80vw', height: '100vh'}}>
              {this.renderTree()}
            </div>
            <div style={{width: '20vw', height: '100vh', textAlign: 'left', marginLeft: '5vw'}}>
              <div>
                <Header as="h2">
                  Users
                </Header>
                { this.renderUsers() }
              </div>
            </div>
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

  renderJoinText = () => {
    return (<Header as="h2"> Enter your name to join</Header>)
  }

  renderEntranceForm(){
    return (
      <div style={{margin: '0 auto', display: 'table'}}>
        {this.renderJoinText()}
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
    if (this.chainIsEmpty(this.state.chain)){
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

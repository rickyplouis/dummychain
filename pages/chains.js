import React from 'react'

import fetch from 'isomorphic-fetch'
import io from 'socket.io-client'

import PageContainer from '../components/pageContainer'

import { Header, Form, Button, Input, Label } from 'semantic-ui-react'
import Head from 'next/head';

import { Graph } from '@vx/network'
import {scaleOrdinal, schemeCategory20c} from 'd3-scale';


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
      nodes: [{x: 50, y: 20}, {x: 200, y: 300}, {x: 300, y: 40}],
    }
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

  addNode = (e) => {
    e.preventDefault();
    const newNodes = this.state.nodes;
    newNodes.push({x: parseInt(1600 * Math.random()), y: parseInt(800 * Math.random())})
    this.setState({
      ...this.state,
      nodes: newNodes
    })
  }

  makeLinks = () => {
    let links = [];
    for (let x = 0; x < this.state.nodes.length -1; x++){
      links.push({source: this.state.nodes[x], target: this.state.nodes[x+1]})
    }
    return links;
  }

  renderGraph = () => {
    const sampleData = {
      nodes: this.state.nodes,
      links: this.makeLinks()
    };

    return <svg width={'100vw'} height={'100vh'}>
            <rect width={'100vw'} height={'100vh'} rx={14} fill='#272b4d' />
            <Graph graph={sampleData} />
           </svg>
  }

  renderChain = () => {
      return (
        <div style={{margin: '0 auto', display: 'table'}}>
          <Header as="h2">In Chain {this.state.chain.chainName}</Header>
          <Form>
            <Form.Button content="Add Node" onClick={(e) => this.addNode(e)}/>
          </Form>
          {this.renderGraph()}
        </div>
      )
  }

  connectUser = () => {
    this.setState({
      userConnected: true
    })
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

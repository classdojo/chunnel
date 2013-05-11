net           = require "net"
ChunnelClient = require "./client"
EventEmitter  = require("events").EventEmitter
SocketServer  = require("../socket").Server
HttpServers   = require("./httpServers")

class ChunnelServer extends SocketServer

  ###
  ###

  constructor: (@options) ->
    super()

    @password = options.password


    @_clients = []
    @_cid     = 0

    @_httpServers = new HttpServers()

    @on "client", @_onChunnelClient
    @on "connection", @_onHttpConnection

  ###
  ###

  listen: (port = 9526) ->
    super port
    console.log "chunnel server listening on port #{port} #{if @secret then 'with secret' else ''}"
    @


  ###
  ###

  _onChunnelClient: (message, socket) ->

    domain = message.domain
    password = message.password

    if password isnt @password
      return socket.error "Incorrect password"

    console.log "client \"#{message.username}\" connected on domain #{domain}"

    # listen in on the domain provided by the initial handshake
    if not @_httpServers.hasClient domain
      return socket.error new Error "cannot listen on domain #{domain} (might already be taken)"

    # wrap around the socket
    @_clients[String(++@_cid)] = client = new ChunnelClient socket, domain

    @_httpServers.listen domain, client
    
    # listen when the connection closes
    client.once "close", () =>
      @_clients.splice(@_clients.indexOf(client), 1)

    # send a success response back to the client
    socket.send "success", { cid: @_cid, secret: client.secret }


  ###
  ###

  _onHttpConnection: (message, socket) ->
    if not client = @_clients[String(message.cid)]
      return socket.error new Error "cid does not exist"

    console.log "adding tunneled http connection for #{client._domain}"

    client.addConnection socket.connection, message.secret


module.exports = (options) -> new ChunnelServer options





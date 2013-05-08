// Generated by CoffeeScript 1.6.2
(function() {
  var Client, EventEmitter, Url, net, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require("events").EventEmitter;

  net = require("net");

  Url = require("url");

  Client = (function(_super) {
    __extends(Client, _super);

    function Client() {
      _ref = Client.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    /*
    */


    Client.prototype.connect = function(options, callback) {
      var c, hostParts, proxyParts,
        _this = this;

      this.options = options;
      if (!~options.server.indexOf("://")) {
        options.server = "http://" + options.server;
      }
      if (!~options.proxy.indexOf("://")) {
        options.proxy = "http://" + options.proxy;
      }
      hostParts = Url.parse(options.server);
      proxyParts = Url.parse(options.proxy);
      c = net.connect(Number(hostParts.port), hostParts.hostname);
      c.write("connect:" + options.domain);
      return c.once("data", function(data) {
        var cid, cmd, domain, kp, secret;

        kp = String(data).split(":");
        cmd = kp.shift();
        if (cmd === "error") {
          console.error(kp.shift());
          return process.exit();
        }
        if (cmd === "success") {
          cid = kp.shift();
          secret = kp.shift();
          domain = kp.shift();
          console.log("tunnel \"" + options.proxy + "\" is now accessible via \"" + domain + "\" on \"" + options.server + "\"");
        }
        return c.on("data", function(data) {
          var c2, i, _i, _len, _ref1, _results;

          _ref1 = String(data).split("1");
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            i = _ref1[_i];
            console.log("creating http connection");
            c2 = net.connect(Number(proxyParts.port), proxyParts.hostname);
            c = net.connect(Number(hostParts.port), hostParts.hostname);
            c.write("tunnel:" + cid + ":" + secret + ":" + domain);
            c2.pipe(c);
            _results.push(c.pipe(c2));
          }
          return _results;
        });
      });
    };

    return Client;

  })(EventEmitter);

  /*
  */


  exports.connect = function(options, callback) {
    return new Client().connect(options, callback);
  };

}).call(this);
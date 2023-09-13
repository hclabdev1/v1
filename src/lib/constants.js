module.exports = Object.freeze({
    EMAIL_AUTH_EXPIRY: 18000000,          // 30 minutes in unix time
    EARTH_RADIUS: 6371,                  // earth radius in km for caluculating map
    CONNECTION_TIMEOUT: 10000,           // websocket connection timeout
    NNMSVR_MONITORING_INTERVAL_MIN: 1,   // monitoring server watch function interval
    SQL_RESERVE_DURATION: 15,            // Reserve function duration in minute
    SQL_HEARTBEAT_LIMIT: 10,             // limit of heartbeat from charging station in minute
    SQL_ANGRY_EXPIRY: 15,                // angry expiry in minute
    SQL_FINISHING_EXPIRY: 10,            // finishing expiry in minute
    SQL_WAITING_EXPIRY: 10               // waiting expiry in minute
});

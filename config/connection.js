const configs = {
    username:process.env.DB_USERNAME,
    password:process.env.PASSWORD,
    dbName:process.env.DBNAME,
    cluster:process.env.CLUSTER,
    port:process.env.PORT,
    tokenKey: process.env.TOKEN_KEY,
	tokenExpiryTime: process.env.TOKEN_EXPIRY_TIME,
    authMail:process.env.AUTH_MAIL,
    authPassword:process.env.AUTH_PASSWORD,
    secretKey:process.env.SECRET_KEY,
}
module.exports = configs;
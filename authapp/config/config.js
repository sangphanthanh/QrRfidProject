module.exports = {
	database: 'mongodb://localhost:27017/authapp',
	secret: 'AuthenticationTokenKey',
	port: '8000',
	TokenTime: '7d',
	roundSalt: 10 //set salt 10 round for bcrypt
}

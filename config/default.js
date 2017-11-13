module.exports = {
	port: 8080,
	session: {
		secret: 'myblog',
		key: 'myblog',
		maxAge: 2592000000
	},
	mongodb: 'mongodb://localhost:27017/myblog',
	weixin:{
		"token":"yst",
		"appid":"wx4e9694cd9195f508",
		"appsecret":"523d3da05885d3c8102400b6b4f32b94",
		"granttype":"client_credential"
	}
};
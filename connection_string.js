module.exports = function (env) {
	var option = {};
	if (env === 'development') {
		option = {
			host: 'localhost',
			port: '3306',
			user: 'localhostuser',
			password: 'localhostpassword',
			database: 'localhostdatabase'
		};
	} else if (env === 'production') {
		option = {
			host: 'live',
			port: '3306',
			user: 'live_user',
			password: 'live_password',
			database: 'live_database'
		};
	}
	return option;
};
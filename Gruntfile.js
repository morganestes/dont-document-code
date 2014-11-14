module.exports = function(grunt) {
	require('matchdep').filterDev('grunt-*').forEach( grunt.loadNpmTasks );

	var _ = require('lodash-node'),
		fs = require('fs')
		slideContent = _.compact( fs.readFileSync('content').toString().split("\n") ),
		config = {
		clean: {
			public: 'public/**/*'
		},
		jade: {
			src: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: '**/*.jade',
					dest: 'public/',
					ext: '.html'
				}],
				options: {
					data: {
						pageTitle: 'Building Membership Sites on WordPress' ,
						'slideContent': slideContent
					},
					pretty: true
				}

			}
		},
		copy: {
			src: {
				files: [{
					expand: true,
					cwd: 'src/',
						src: [
							'**/*',
							'!<%= jade.src.files[0].src %>'
						],
					dest: 'public/'
					}]
			}
		},
		watch: {
			jade: {
				files: ['<%= jade.src.files[0].cwd + jade.src.files[0].src %>','content'],
				tasks: 'jade'
			},
			copy: {
				files: [
					'<%= copy.src.files[0].cwd + copy.src.files[0].src[0] %>',
					'!<%= jade.src.files[0].cwd + jade.src.files[0].src %>',
				],
				tasks: 'copy:src'
			},
			public: {
				files: [
					'public/**/*',
					'!public/bower_components/**/*'
				],
				options: {
				livereload: 35729
				}
			}
		},
		connect: {
			server: {
				options: {
					port: 8000,
					base: 'public',
					keepalive: true,
					middleware: function(connect, options) {
						return [
							require('connect-livereload')({
								port: config.watch.public.options.livereload
							}),
							connect.static(options.base)
						];
					}
				}
			}
		},
		open: {
			server: {
				path: 'http://localhost:<%= connect.server.options.port %>'
			}
		},
		concurrent: {
			compile: {
				tasks: [
					'jade',
					'copy'
				],
				options: {
					logConcurrentOutput: false
				}
			},
			server: {
				tasks: [
					'connect',
					'open',
					'watch:jade',
					'watch:copy',
					'watch:public'
				],
				options: {
					logConcurrentOutput: true
				}
			}
		},
		'gh-pages': {
			public: {
				options: {
					base: 'public',
					message: 'Generated by morganestes'
				},
				src: '**/*'
			}
		}
	};

	grunt.initConfig(config);

	grunt.registerTask('default', ['clean', 'concurrent:compile']);
	grunt.registerTask('server', ['default', 'concurrent:server']);
	grunt.registerTask('deploy', ['default', 'gh-pages:public']);

};

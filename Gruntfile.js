module.exports = function( grunt ) {

    grunt.initConfig( {

        // Import package manifest
        pkg: grunt.file.readJSON( "package.json" ),

        // Banner definitions
        meta: {
            banner: "/*\n" +
            " *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
            " *  <%= pkg.description %>\n" +
            " *  <%= pkg.homepage %>\n" +
            " *\n" +
            " *  Made by <%= pkg.author.name %>\n" +
            " *  Under <%= pkg.license %> License\n" +
            " */\n"
        },

        // Concat definitions
        concat: {
            options: {
                banner: "<%= meta.banner %>"
            },
            dist: {
                src: [
                    "src/jquery.ands.registry-widget.templates.js",
                    "src/jquery.ands.registry-widget.api-service.js",
                    "src/jquery.ands.registry-widget.js"
                ],
                dest: "dist/jquery.ands.registry-widget.js"
            }
        },

        // Lint definitions
        jshint: {
            files: [ "src/jquery.ands.registry-widget.js", "test/**/*.js" ],
            options: {
                jshintrc: ".jshintrc"
            }
        },

        jscs: {
            src: "src/**/*.js",
            options: {
                config: ".jscsrc"
            }
        },

        // Minify definitions
        uglify: {
            dist: {
                src: [ "dist/jquery.ands.registry-widget.js" ],
                dest: "dist/jquery.ands.registry-widget.min.js"
            },
            options: {
                banner: "<%= meta.banner %>"
            }
        },

        // karma test runner
        karma: {
            unit: {
                configFile: "karma.conf.js",
                background: true,
                singleRun: false,
                browsers: [ "PhantomJS", "Firefox", "Chrome", "ChromeNoSecurity", "Safari" ],
            },

            //continuous integration mode: run tests once in PhantomJS browser.
            travis: {
                configFile: "karma.conf.js",
                singleRun: true,
                browsers: [ "PhantomJS", "Firefox", "Chrome", "ChromeNoSecurity", "Safari" ],
                customLaunchers: {
                    ChromeNoSecurity: {
                        base: "Chrome",
                        flags: [ "--disable-web-security" ]
                    }
                }
            }
        },

        // watch for changes to source
        // Better than calling grunt a million times
        // (call 'grunt watch')
        watch: {
            files: [ "src/*", "test/**/*" ],
            tasks: [ "default" ]
        }

    } );

    grunt.loadNpmTasks( "grunt-contrib-concat" );
    grunt.loadNpmTasks( "grunt-contrib-jshint" );
    grunt.loadNpmTasks( "grunt-jscs" );
    grunt.loadNpmTasks( "grunt-contrib-uglify" );
    grunt.loadNpmTasks( "grunt-contrib-coffee" );
    grunt.loadNpmTasks( "grunt-contrib-watch" );
    grunt.loadNpmTasks( "grunt-karma" );

    grunt.registerTask( "travis", [ "jshint", "karma:travis" ] );
    grunt.registerTask( "lint", [ "jshint", "jscs" ] );
    grunt.registerTask( "build", [ "concat", "uglify" ] );
    grunt.registerTask( "default", [ "jshint", "build", "karma:unit" ] );
};
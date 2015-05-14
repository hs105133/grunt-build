module.exports = function(grunt) {

    var appPath = 'public/',
        indexPath = appPath + 'index.html',
        cssFiles = [],
        jsFiles = [],
        mozjpeg = require('imagemin-mozjpeg'),
        buildNumber = Math.floor(Math.random() * 10000),
        moduleName = "myApp";

    function getFilesList(indexPath, appPath) {
        var indexContents,
            scriptTagsPattern,
            cssTagsPattern,
            templateFilePath,
            match;

        if (!grunt.file.exists(indexPath)) {
            grunt.log.warn('Index file "' + indexPath + '" not found.');
            return false;
        }
        
        indexContents = grunt.file.read(indexPath);

        //read script tags
        scriptTagsPattern = /<script.+?src="(.+?)".*?><\/script>/gm;
        match = scriptTagsPattern.exec(indexContents);
        while (match) {
            // if (!(/livereload-setup\.js/.test(match[1]))) {
            jsFiles.push(appPath + match[1]);
            // }
            match = scriptTagsPattern.exec(indexContents);
        }

        //read css tags
        cssTagsPattern = /<link.+?href="(.+?\.css)".*?\/?>/gm;
        match = cssTagsPattern.exec(indexContents);
        while (match) {
            cssFiles.push(appPath + match[1]);
            match = cssTagsPattern.exec(indexContents);
        }

        return {
            jsFiles: jsFiles,
            cssFiles: cssFiles
        };
    }

    var appObj = getFilesList(indexPath, appPath);

    appObj.jsFiles.push(appPath + ".temp/js/templates.js");

    grunt.initConfig({

        // JS TASKS ================================================================
        jshint: {
            all: [appPath + 'js/**/*.js']
        },

        ngAnnotate: {
            options: {
                // remove: true,
                add: true,
                singleQuotes: true
            },

            files: {
                expand: true,
                cwd: appPath + '.temp/js',
                src: ['app.js'],
                dest: appPath + '.temp/js'
            }

        },
        uglify: {
            build: {
                options: {
                    mangle: true
                        // beautify: true,
                        // compress: false,
                        // preserveComments: "all"
                },

                files: [{
                    expand: true,
                    cwd: appPath + '.temp/js',
                    src: "app.js",
                    dest: 'build/js/',
                    ext: buildNumber + '.min.js'
                }]
            }
        },

        // CSS TASKS ===============================================================
        less: {
            build: {
                files: {
                    'build/css/style.css': appPath + 'css/main.less'
                }
            }
        },
        concat: {
            dist: {
                src: cssFiles,
                dest: appPath + '.temp/app.css',
            },

            distjs: {
                src: jsFiles,
                dest: appPath + '.temp/js/app.js',
            }
        },

        cssUrlEmbed: {
            encode: {
                expand: true,
                cwd: appPath + '.temp/',
                src: ["app.css"],
                dest: appPath + '.temp/'
            }
        },

        cssmin: {
            minify: {
                expand: true,
                cwd: appPath + '.temp/',
                src: ['app.css'],
                dest: 'build/css/',
                ext: buildNumber + '.min.css'
            }
        },

        // COOL TASKS ==============================================================
        watch: {
            css: {
                files: [appPath + 'css/**/*.less'],
                tasks: ['less', 'cssmin']
            },
            js: {
                files: [appPath + 'js/**/*.js'],
                tasks: ['jshint', 'uglify']
            }
        },

        htmlrefs: {
            dist: {
                src: appPath + '*.html',
                dest: 'build/index.html',
                options: {
                    buildNumber: buildNumber
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    cwd: 'build',
                    src: '*.html',
                    dest: 'build'
                }, {
                    expand: true,
                    cwd: appPath + 'views',
                    src: '*.html',
                    dest: 'build/views/'
                }]
            }
        },
        copy: {
            main: {
                files: [
                    // {
                    //     expand: true,
                    //     flatten: true,
                    //     src: [appPath + 'images/*'],
                    //     dest: 'build/images/',
                    //     filter: 'isFile'
                    // },
                    {
                        expand: true,
                        flatten: true,
                        src: ['.htaccess', 'myapp.appcache', appPath + 'offline.html'],
                        dest: 'build/',
                        filter: 'isFile'
                    }, {
                        expand: true,
                        flatten: true,
                        src: ['.htaccess', 'myapp.appcache', appPath + 'offline.html', appPath + "data/*"],
                        dest: 'build/data/',
                        filter: 'isFile'
                    }, {
                        expand: true,
                        flatten: true,
                        src: [appPath + "fonts/*"],
                        dest: 'build/fonts/',
                        filter: 'isFile'
                    }
                ]
            }
        },
        clean: [".temp", "build"],

        ngtemplates: {
            app: {
                cwd: appPath,
                src: ['views/partials/*.html', 'views/home.html'],
                dest: appPath + '.temp/js/templates.js',
                options: {
                    module: moduleName,
                    htmlmin: {
                        collapseWhitespace: true,
                        collapseBooleanAttributes: true
                    }
                }
            }
        },
        imagemin: {
            dynamic: {
                options: {
                    optimizationLevel: 7,
                    use: [mozjpeg()]
                },
                files: [{
                    expand: true, // Enable dynamic expansion
                    cwd: appPath, // Src matches are relative to this path
                    src: ['images/**/*.{png,jpg,gif}'], // Actual patterns to match
                    dest: 'build/' // Destination path prefix
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-htmlrefs');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-css-url-embed');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-imagemin');

    grunt.registerTask('default', ['clean', 'ngtemplates', 'concat', 'ngAnnotate', 'uglify', 'cssmin', 'htmlrefs', 'htmlmin', 'copy', 'imagemin'])

};

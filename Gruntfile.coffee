module.exports = (grunt)->

  # beautify
  grunt.registerTask('beautify', [ 'jsbeautifier:working' ])

  # Run `grunt server` for live-reloading development environment
  grunt.registerTask('server', [ 'build', 'express', 'watch' ])
  
  grunt.registerTask('server:seed', [ 'build', 'express', 'shell:seedData', 'watch' ])
  
  # Run `grunt server:unit` for live-reloading unit testing environment
  grunt.registerTask('server:unit', [ 'build', 'karma:background', 'watch:unit' ])

  # Run `grunt test` (used by `npm test`) for continuous integration (e.g. Travis)
  grunt.registerTask('test', [ 'test:unit' ])

  # Run `grunt test:unit` for single-run unit testing
  grunt.registerTask('test:unit', [ 'build', 'karma:unit' ])

  # Run `grunt test:browsers` for real-world browser testing
  grunt.registerTask('test:e2e', [ 'build', 'karma:e2e' ])

  # Clean, validate & compile web-accessible resources
  grunt.registerTask('build', [ 'wiredep','clean', 'jshint', 'copy', 'ngtemplates', 'less' ])

  # Optimize pre-built, web-accessible resources for production, primarily `usemin`
  grunt.registerTask('optimize', [ 'useminPrepare', 'concat', 'uglify', 'cssmin', 'usemin', 'clean:postOptimize', 'exec:cleanEmpties' ])

  # Optimize pre-built, web-accessible resources for production, primarily `usemin`
  grunt.registerTask('optimize', [ 'useminPrepare', 'concat', 'uglify', 'cssmin', 'usemin', 'clean:postOptimize', 'exec:cleanEmpties' ])

  # Configuration
  grunt.config.init

    # Directory CONSTANTS (see what I did there?)
    BUILD_DIR:      'build/'
    CLIENT_DIR:     'client/'
    BOWER_DIR:      'bower_components/'
    SERVER_DIR:     'server/'

    # Glob CONSTANTS
    ALL_FILES:      '**/*'
    CSS_FILES:      '**/*.css'
    HTML_FILES:     '**/*.html'
    IMG_FILES:      '**/*.{png,gif,jpg,jpeg}'
    JS_FILES:       '**/*.js'
    LESS_FILES:     '**/*.less'


    # beautify
    jsbeautifier:
      working:
        src:        [ '<%= CLIENT_DIR + JS_FILES %>'
                      '<%= SERVER_DIR + JS_FILES %>' ]
	
	# wiredep
    wiredep:
      task:
        src:        ['<%= CLIENT_DIR + HTML_FILES%>']
    
    # Wipe the `build` directory
    clean:
      build:        '<%= BUILD_DIR %>'

      postOptimize: [ '<%= BUILD_DIR %>/app/test'
                      '<%= BUILD_DIR %>/app/styles/**/*'
                      '!<%= BUILD_DIR %>/app/styles/**/*.min.css'
                      '<%= BUILD_DIR %>/app/scripts/**/*'
                      '!<%= BUILD_DIR %>/app/scripts/**/*.min.js'
                    ]

    exec:
      cleanEmpties:
        cmd: "find build -type d -empty -delete"

    copy:
      # App images from Bower `components` & `client`
      images:
        files:      [
          expand:   true,
          cwd:      '<%= BOWER_DIR %>/bootstrap/img'
          src:      '<%= IMG_FILES %>'
          dest:     '<%= BUILD_DIR %>/img'
        ,
          expand:   true
          cwd:      '<%= CLIENT_DIR %>'
          src:      '<%= IMG_FILES %>'
          dest:     '<%= BUILD_DIR %>'
        ]

      # Copy `client` -> `build`, as resources are served from `build`
      client:
        files:      [
          expand:   true
          cwd:      '<%= CLIENT_DIR %>'
          src:      '<%= ALL_FILES %>'
          dest:     '<%= BUILD_DIR %>'
        ]

      # Make bower HTTP-accessible
      bower:
        files:
          '<%= BUILD_DIR %>': '<%= BOWER_DIR + ALL_FILES %>'

      # app (non-Bower) JS in `client`
      js:
        files:      [
          expand:   true
          cwd:      '<%= CLIENT_DIR %>'
          src:      '<%= JS_FILES %>'
          dest:     '<%= BUILD_DIR %>'
        ]

      # app (non-Bower) HTML in `client`
      templates:
        files:      [
          expand:   true
          cwd:      '<%= CLIENT_DIR %>'
          src:      '<%= HTML_FILES %>'
          dest:     '<%= BUILD_DIR %>'
        ]

    # Express requires `server.script` to reload from changes
    express:
      server:
        options:
          script:   '<%= SERVER_DIR %>/server.js'

    # Validate app `client` and `server` JS
    jshint:
      files:        [ '<%= SERVER_DIR + JS_FILES %>'
                      '<%= CLIENT_DIR + JS_FILES %>' ]
      options:
        es5:        true
        laxcomma:   true  # Common in Express-derived libraries

    # Browser-based testing
    karma:
      options:
        configFile: 'karma.conf.js'

      # Used for running tests while the server is running
      background:
        background: true
        singleRun:  false

      # Used for testing site across several browser profiles
      e2e:
        browsers:   [ 'PhantomJS' ] # 'Chrome', 'ChromeCanary', 'Firefox', 'Opera', 'Safari', 'IE', 'bin/browsers.sh'
        singleRun:  true

      # Used for one-time validation (e.g. `grunt test`, `npm test`)
      unit:
        singleRun:  true

    # Compile `app.less` -> `app.css`
    less:
      '<%= BUILD_DIR %>/app/styles/app.css': '<%= CLIENT_DIR %>/app/styles/app.less'
      '<%= BUILD_DIR %>/app/styles/override.css': '<%= CLIENT_DIR %>/app/styles/override.less'
      	


    # Minify app `.css` resources -> `.min.css`
    cssmin:
      app:
        expand:     true
        cwd:        '<%= BUILD_DIR %>'
        src:        '<%= CSS_FILES %>'
        dest:       '<%= BUILD_DIR %>'
        ext:        '.min.css'

    # Convert Angular `.html` templates to `.js` in the `app` module
    ngtemplates:
      app:
        src:        '<%= BUILD_DIR %>/app/<%= HTML_FILES %>'
        dest:       '<%= BUILD_DIR %>/app/scripts/app.templates.js'
        options:
          base:     '<%= BUILD_DIR %>'

    # Output for optimized app index
    usemin:
      html:         '<%= BUILD_DIR %>/index.html'

    # Input for optimized app index
    useminPrepare:
      html:         '<%= BUILD_DIR %>/index.html'

    # "watch" distinct types of files and re-prepare accordingly
    watch:
      options:
        debounceDelay:  200
        livereload:     true
        nospawn:        true

      # Any public-facing changes should reload the browser & re-run tests (which may depend on those resources)
      build:
        files:      [ '<%= BUILD_DIR + ALL_FILES %>', '!**/<%= BOWER_DIR %>/**' ]

      # Changes to app code should be validated and re-copied to the `build`, triggering `watch:build`
      js:
        files:      '<%= CLIENT_DIR + JS_FILES %>'
        tasks:      [ 'copy:js', 'jshint' ]

      # Changes to app styles should re-compile, triggering `watch:build`
      less:
        files:      '<%= CLIENT_DIR + LESS_FILES %>'
        tasks:      [ 'less' ]

      # Changes to server-side code should validate, restart the server, & refresh the browser
      server:
        files:      '<%= SERVER_DIR + ALL_FILES %>'
        tasks:      [ 'jshint', 'express']

      # Changes to app templates should re-copy & re-compile them, triggering `watch:build`
      templates:
        files:      '<%= CLIENT_DIR + HTML_FILES %>'
        tasks:      [ 'copy:templates', 'ngtemplates' ]

      # Changes to app code should be validated and re-copied to the `build`, triggering `watch:build`
      unit:
        files:      '<%= CLIENT_DIR + JS_FILES %>'
        tasks:      [ 'copy:js', 'jshint']

    shell:
      seedData:
        command:    'node server/seed'
        options:    
          stdout:   true

  # Dependencies
  grunt.loadNpmTasks('grunt-angular-templates')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-cssmin')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-express-server')
  grunt.loadNpmTasks('grunt-karma')
  grunt.loadNpmTasks('grunt-exec')
  grunt.loadNpmTasks('grunt-shell')
  # grunt.loadNpmTasks('grunt-regarde')
  # grunt.loadNpmTasks('grunt-parallel')
  grunt.loadNpmTasks('grunt-usemin')
  grunt.loadNpmTasks('grunt-jsbeautifier')
  grunt.loadNpmTasks('grunt-wiredep')
  

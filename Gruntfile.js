module.exports = function(grunt) {// jshint ignore:line
  var semver = require('semver');
  var util = require('util');
  var pkg = grunt.file.readJSON('package.json');
  var major = semver.major(pkg.version);
  var minor = semver.minor(pkg.version);
  var patch = semver.patch(pkg.version);

  var previousTag = util.format('v%d.%d.%d',major,minor,0);

  grunt.initConfig({
    pkg:pkg,
    jshint: {
      files: ['lib/**/*.js','test/unit/*.js','test/api/*.js'],
      options: {
        jshintrc: '.jshintrc',
        ignores: ['test/coverage/**/*.js'],
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
    },

    jscs: {
      src: '<%= jshint.files %>',
      options: {
        config: '.jscsrc',
      },
    },

    watch: {
      lint: {
        files: '<%= jshint.files %>',
        tasks: ['jshint','jscs'],
      },
      test: {
        files: ['test/unit/*.js'],
        tasks: ['jshint', 'jscs', 'mochaTest:unit'],
      },
    },

    mochaTest: {
      unit: {
        options: {
          reporter: 'spec',
        },
        src: ['test/unit/*.js'],
      },
      api: {
        options: {
          reporter: 'spec',
        },
        src: ['test/api/*.js'],
      },
    },


    // start - code coverage settings
    env: {
      coverage: {
        APP_DIR_FOR_CODE_COVERAGE: '../test/coverage/instrument/lib/',
      },
    },


    clean: {
      coverage: {
        src: ['test/coverage/'],
      },
    },

    instrument: {
      files: 'lib/*.js',
      options: {
        lazy: true,
        basePath: 'test/coverage/instrument/'
      }
    },

    storeCoverage: {
      options: {
        dir: 'test/coverage/reports'
      }
    },

    makeReport: {
      src: 'test/coverage/reports/**/*.json',
      options: {
        type: 'lcov',
        dir: 'test/coverage/reports',
        print: 'detail'
      }
    },
    // end - code coverage settings

    // bump version
    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: ['pkg'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json','CHANGE.md'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false,
        prereleaseName: false,
        regExp: false
      },
    },

    // change log
    changelog: {
      sample: {
        options: {
          after:previousTag,
          fileHeader: '\n# v<%= pkg.version%>\n'
        }
      }
    },

    // grunt-git begin
    gitpush: {
      dev: {
        options: {
          all:true,
        }
      },
    },
    // grunt-git end

    // concat
    concat: {
      change:{
        src:['changelog.txt','CHANGE.md'],
        dest:'CHANGE.md',
      },
    },
  });


  // plugins
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-istanbul');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-changelog');
  grunt.loadNpmTasks('grunt-git');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // tasks
  grunt.registerTask('test', [
    'jshint', 'jscs',
    'mochaTest:unit', 'mochaTest:api',
  ]);
  grunt.registerTask('default', ['test']);

  grunt.registerTask('coverage', [
    'jshint', 'jscs', 'clean', 'env:coverage',
    'instrument', 'mochaTest:unit',
    'storeCoverage', 'makeReport',
  ]);

  grunt.registerTask('push',[
    'test',
    'gitpush:dev',
  ]);

  grunt.registerTask('patch',[
    'test',
    'bump:patch',
    'bump-commit',
  ]);

  grunt.registerTask('minor',[
    'test',
    'bump-only:minor',
    'changelog',
    'concat:change',
    'bump-commit',
  ]);

  grunt.registerTask('major',[
    'test',
    'bump-only:major',
    'changelog',
    'concat:change',
    'bump-commit',
  ]);
};// jshint ignore:line

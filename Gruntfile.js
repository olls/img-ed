module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      css: {
        options: {
          livereload: true
        },
        files: ['src/css/main.css'],
        tasks: ['autoprefixer']
      },
      main: {
        options: {
          livereload: true
        },
        files: ['**/*']
      }
    },
    autoprefixer: {
      main: {
        src: 'src/css/main.css',
        dest: 'src/css/main.pre.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-autoprefixer');
  
  grunt.registerTask('default', ['watch']);

};

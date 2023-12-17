const gulp = require('gulp');
const sass = require('gulp-sass')(require('node-sass'));
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const replace = require('gulp-replace');
const htmlmin = require('gulp-htmlmin');
const htmlclean = require('gulp-htmlclean');
const cleanCSS = require('gulp-clean-css');
const fileInclude = require('gulp-file-include');
const del = require('del');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const fs = require('fs');

const webpack = require('webpack-stream');

const icons = require('./icons/icons.js');

const replacements = require('./global-variables.js');

replacements.version = getVersion();

let env = 'production';

function clean() {
    return del(['public/**/*']);
}


function getVersion() {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const version = packageJson.version;
    return version;
}



function html() {
    return gulp
        .src('resources/html/*.html')
        .pipe(fileInclude({
            prefix: '{{',
            suffix: '}}',
            basepath: '@file'
        }))
        .pipe(replace(/__compiler__(\w+)__/g, replaceVariables))
        .pipe(replace(/<icon([^>]*)>/g, function(match, p1) {
            const attributes = {};
            let atts = '';

            p1.replace(/(\w+)="([^"]+)"/g, function(_, key, value) {
                attributes[key] = value;
                if (key !== 'name' && key !== 'type'){
                    atts += ' ' + key + '="' + value + '"'
                }
            });

            const name = attributes['name'];
            const type = attributes['type'];

            delete attributes.name;
            delete attributes.type;

            let icon = '';

            if (typeof icons[type][name] === 'string'){
                icon = icons[type][name]?.replace('{{ATTS}}',atts) || '';
            }

            return icon;
        }))
        .pipe(htmlclean())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true,
        }))
        .pipe(gulp.dest('public/'));
}

function css() {
    return gulp
        .src('resources/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(replace(/__compiler__(\w+)__/g, replaceVariables))
        .pipe(cleanCSS())
        .pipe(autoprefixer())
        .pipe(replace('-webkit-box-orient', 'box-orient'))
        .pipe(cssnano(({reduceIdents: false,zindex: false})))
        .pipe(replace('box-orient', '-webkit-box-orient'))
        .pipe(gulp.dest('public/css'));
}

function js() {
    let g = gulp
        .src(['resources/js/*.js','!resources/js/*.js.map'])
        .pipe(replace(/__compiler__(\w+)__/g, replaceVariables))
        .pipe(webpack(require('./webpack.config.js')(env), require('webpack')));

    if(env === 'production'){
        g = g.pipe(terser(require('./terser-options')))
    }

    g = g.pipe(gulp.dest('public/js'));

    return g;
}

function assets() {
    return gulp
        .src('resources/assets/**/*.*')
        .pipe(gulp.dest('public/assets'));
}

function watch() {
    gulp.watch('resources/assets/**/*.*', assets);
    gulp.watch('resources/**/*.html', html);
    gulp.watch('resources/**/*.scss', css);
    gulp.watch('resources/**/*.js', js);
    gulp.watch('dynamic-js/**/*.js', js);
    gulp.watch('routes.json', js);
}

function esp() {
    return gulp
        .src('index.php')
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true,
        }))
        .on('error', function (err) {
            console.error('Error in minifyHTML task:', err.toString());
            this.emit('end');
        })
        .pipe(replace(/"/g, '\\"')) // Use regular expression and escape the double quotes properly
        .pipe(rename('./ino/esp-content.html'))
        .pipe(gulp.dest('./'));
}

function __default(done){
    env = 'development';
    done();
}

function __build(done){
    env = 'production';
    done();
}

function replaceVariables(match, p1){
    const replacementKey = p1;
    if (replacements.hasOwnProperty(replacementKey)) {
        return replacements[replacementKey];
    } else {
        return match;
    }
}

// Exports
exports.assets = assets;
exports.html = html;
exports.css = css;
exports.js = js;
exports.watch = watch;
exports.clean = clean;

exports.esp = esp;

exports.build = gulp.series(
    __build,
    clean,
    gulp.parallel(
        assets,
        html,
        css,
        js
    )
);

exports.default = gulp.series(
    __default,
    clean,
    gulp.parallel(
        assets,
        html,
        css,
        js
    ),
    watch
);

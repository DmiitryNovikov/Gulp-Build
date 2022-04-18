//? Прописываем в константы модули (делаем связь)

/* RequireJS – это библиотека JavaScript и загрузчик файлов, которая управляет зависимостями 
между файлами JavaScript и в модульном программировании. Это также помогает улучшить скорость 
и качество кода. */

const gulp = require("gulp");
const less = require("gulp-less");
const rename = require("gulp-rename"); // подписывает файлы в нужном формате
const cleanCSS = require("gulp-clean-css"); //минимизирует(минимфицирует) CSS код удаляя пробелы и компануя согл. классов и
const babel = require("gulp-babel"); // бейбл помогает перевести JS код в более старый синтаксис который будет понятен большинству браузеров
const uglify = require("gulp-uglify"); // минимизирует(минимфицирует) JS скрипт
const concat = require("gulp-concat"); // конкатенация (обьеденение) файлоф JS
const del = require("del"); //плагин по отчистке

//? Прописываем пути. Src - путь откуда. Dest - путь куда

const paths = {
  styles: {
    src: "src/styles/**/*.less",
    dest: "dist/css/",
  },
  scripts: {
    src: "src/scripts/**/*.js",
    dest: "dist/js/",
  },
};

//? Прописываем ф-ции

//Функция отчистки папки dist
function clean() {
  return del(["dist"]);
}

/* Функция компиляции фа-в со стилями в формат сss с дальнейшей минификацией и записью в папку dist
Pipe - это канал, который связывает поток для чтения и поток для записи и позволяет 
сразу считать из потока чтения в поток записи.*/
function styles() {
  return gulp
    .src(paths.styles.src) //забираем по прописанному пути все файлы css
    .pipe(less()) //компилируем less в css
    .pipe(cleanCSS())
    .pipe(
      rename({
        basename: "main",
        suffix: ".min",
      })
    )
    .pipe(gulp.dest(paths.styles.dest)); //результат переменщаем в каталог dest
}

//Функция по преобразованию JS: преобразование в старый синтаксис через бейбл,
// минимизация, обьеденение, создание файла с определенным названием

function scripts() {
  return gulp
    .src(paths.scripts.src, {
      sourcemaps: true,
    })
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat("main.min.js"))
    .pipe(gulp.dest(paths.scripts.dest));
}

function watch() {
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.styles.src, scripts);
}

/* series - позваляет вызывать функции (задачи) последовательно
parallel  - позваляет вызывать функции (задачи) паралельно */

const build = gulp.series(clean, gulp.parallel(styles, scripts), watch);

//? Экспортируем функции тем самым даем возможность вызова через терминал gulp "название"

exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch; // запуск gulp watch а стоп CTRL + C
exports.build = build;
exports.default = build; // default позволяет запускать задачи по умоланию

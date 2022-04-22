//? Прописываем в константы модули (делаем связь)

/* RequireJS – это библиотека JavaScript и загрузчик файлов, которая управляет зависимостями 
между файлами JavaScript и в модульном программировании. Это также помогает улучшить скорость 
и качество кода. */

const gulp = require("gulp");
const less = require("gulp-less");
const sass = require("gulp-sass")(require("sass")); //подключаем плагин sass
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const fonter = require("gulp-fonter"); // для конвертации OTF шрифтов
const rename = require("gulp-rename"); // подписывает файлы в нужном формате
const cleanCSS = require("gulp-clean-css"); //минимизирует(минимфицирует) CSS код удаляя пробелы и компануя согл. классов и
const babel = require("gulp-babel"); // бейбл помогает перевести JS код в более старый синтаксис который будет понятен большинству браузеров
const uglify = require("gulp-uglify"); // минимизирует(минимфицирует) JS скрипт
const concat = require("gulp-concat"); // конкатенация (обьеденение) файлоф JS
const sourcemaps = require("gulp-sourcemaps"); //? Почитать
const autoprefixer = require("gulp-autoprefixer"); // это плагин, который сканирует CSS файлы и расставляет вендорные префиксы (-webkit-, -moz и др.), используя базу Can i use, чтобы определить какие префиксы нужны.
const imagemin = require("gulp-imagemin"); // сжатие изображений
const htmlmin = require("gulp-htmlmin"); //Минификация HTML
const size = require("gulp-size"); //Прописывает размер файло и их названия в терминале
const del = require("del"); //плагин по отчистке
const browsersync = require("browser-sync").create(); //плагин по отчистке
const newer = require("gulp-newer");
const fs = require("fs");

//? Прописываем пути. Src - путь откуда. Dest - путь куда

const paths = {
  html: {
    src: "src/*.html",
    dest: "dist",
  },
  styles: {
    src: [
      "src/styles/**/*.less",
      "src/styles/**/*.sass",
      "src/styles/**/*.scss",
      "src/styles/**/*.styl",
    ],
    dest: "dist/css/",
  },
  scripts: {
    src: "src/scripts/**/*.js",
    dest: "dist/js/",
  },
  images: {
    src: "src/img/**",
    dest: "dist/img/",
  },

  fon: {
    src: "src/fonts/**",
    dest: "dist/fonts/",
  },

  otffon: {
    src: "src/fonts/*.otf",
    dest: "src/fonts/",
  },
};

//? Прописываем ф-ции

//Функция отчистки папки dist
function clean() {
  return del(["dist/*", "!dist/img"]);
}

//Функция минификации HTML
function html() {
  return gulp
    .src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(
      size({
        showFiles: true,
      })
    )
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browsersync.stream());
}

//___________ Функция компиляции фа-в со стилями в формат сss с дальнейшей минификацией и записью в папку dist. Pipe - это канал, который связывает поток для чтения и поток для записи и позволяет сразу считать из потока чтения в поток записи. __________________________________

function styles() {
  return (
    gulp
      .src(paths.styles.src) //забираем по прописанному пути все файлы css
      .pipe(sourcemaps.init())
      //.pipe(less()) //компилируем less в css
      .pipe(sass().on("error", sass.logError)) //компилируем sass в css
      .pipe(
        autoprefixer({
          cascade: false,
        })
      )
      .pipe(
        cleanCSS({
          level: 2,
        })
      )
      .pipe(
        rename({
          basename: "main",
          suffix: ".min",
        })
      )
      .pipe(sourcemaps.write("."))
      .pipe(
        // Прописываем размер в терминале и название файла
        size({
          showFiles: true,
        })
      )
      .pipe(gulp.dest(paths.styles.dest)) //результат переменщаем в каталог dest
      .pipe(browsersync.stream())
  );
}

//_________________Функция по преобразованию JS: преобразование в старый синтаксис через бейбл, минимизация, обьеденение, создание файла с определенным названием ________________

function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(uglify())
    .pipe(concat("main.min.js"))
    .pipe(sourcemaps.write("."))
    .pipe(
      // Прописываем размер в терминале и название файла
      size({
        showFiles: true,
      })
    )
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browsersync.stream());
}

//_______Фу-ция сжатия изображений

function img() {
  return gulp
    .src(paths.images.src)
    .pipe(newer(paths.images.dest)) // Прописываем метод который проверяет именены ли изображения, если нет то не удаляет их
    .pipe(imagemin({ progressive: true }))
    .pipe(
      // Прописываем размер в терминале и название файла
      size({
        showFiles: true,
      })
    )
    .pipe(gulp.dest(paths.images.dest));
}

//_______________Работаем со шрифтами________________

function fontsWoff() {
  return gulp
    .src(paths.fon.src)
    .pipe(ttf2woff())
    .pipe(gulp.dest(paths.fon.dest));
}

function fontsWoff2() {
  return gulp
    .src(paths.fon.src)
    .pipe(ttf2woff2())
    .pipe(gulp.dest(paths.fon.dest));
}
//Запуск функции ниже в ручном режиме, не прописана задача в build.ВАЖНО!Санчала запуск gulp otf2ttf и только потом gulp
function otf2ttf() {
  return gulp
    .src(paths.otffon.src)
    .pipe(fonter({ formats: ["ttf"] }))
    .pipe(gulp.dest(paths.otffon.dest));
}

function watch() {
  //Запускаем сам сервер
  browsersync.init({
    server: {
      baseDir: "./dist/",
    },
  });
  gulp.watch(paths.html.dest).on("change", browsersync.reload); //задаем слежение за HTML и назначаем задачу в случае его изменения "обновелние в браузере"
  gulp.watch(paths.html.src, html);
  gulp.watch(paths.styles.src, styles); //следим за стилями
  gulp.watch(paths.scripts.src, scripts); //следим за JS
  gulp.watch(paths.images.src, img);
}

/* series - позваляет вызывать функции (задачи) последовательно
parallel  - позваляет вызывать функции (задачи) паралельно */

const build = gulp.series(
  clean,
  html,
  gulp.parallel(styles, scripts, img, fontsWoff, fontsWoff2),
  watch
);

//? Экспортируем функции тем самым даем возможность вызова через терминал gulp "название"

exports.clean = clean;
exports.fontsWoff = fontsWoff;
exports.fontsWoff2 = fontsWoff2;
exports.otf2ttf = otf2ttf; //Запуск функции ниже в ручном режиме, не прописана задача в build.ВАЖНО!Санчала запуск gulp otf2ttf и только потом gulp
exports.html = html; //HTMLMin
exports.img = img;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch; // запуск gulp watch а стоп CTRL + C
exports.build = build;
exports.default = build; // default позволяет запускать задачи по умоланию

新規モジュール追加手順
例：新しいパズル new_puzzle を追加する場合

JS作成 js/puzzles/new_puzzle.js を作成し、render 関数と handleAction 関数を記述する。

CSS作成 css/puzzles/new_puzzle.css を作成し、専用スタイルを記述する。

CSS登録 css/modules.css に @import url("puzzles/new_puzzle.css"); を追記する。

JS登録 js/modules.js でファイルをインポートし、puzzleMap（または REGISTRY）に紐付ける。

配置 js/config.js の好きな場所に { type: "new_puzzle" } を追記する。

注意点
紐付け忘れ config.js に書いた type 名と、js/modules.js の puzzleMap のキー名は一字一句完全に一致させること。

関数のexport js/puzzles/new_puzzle.js では必ず export function render(...) と export function handleAction(...) の形にする。（default export は使わない構成にしているため）

クラス名の衝突 CSSのクラス名には、他と被らないようにプレフィックスをつける。（例: 単に .button ではなく .np-button や .new-puzzle-btn にする）
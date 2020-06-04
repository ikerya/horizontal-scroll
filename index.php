<?php
$v = rand();
?>
<!DOCTYPE html>
<html>
<head>
    <link href="css/common.css?<?=$v;?>" rel="stylesheet">
    <link href="css/horizontal-scroll.css?<?=$v;?>" rel="stylesheet">
    <script src="js/horizontal-scroll.js?<?=$v;?>"></script>
</head>
<body>
    <div class="container">
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
        <div class="item">4</div>
        <div class="item">5</div>
        <div class="item">6</div>
        <div class="item">7</div>
        <div class="item">8</div>
        <div class="item">9</div>
        <div class="item">10</div>
        <div class="item">11</div>
        <div class="item">12</div>
        <div class="item">13</div>
        <div class="item">14</div>
    </div>

    <script>
        window.addEventListener('DOMContentLoaded', () => {
            const left = document.createElement('span');
            const right = document.createElement('span');

            left.innerText = '<';
            right.innerText = '>';

            const controls = {
                left,
                right
            };

            window.scroll = new Scroll(document.querySelector('.container'), {
                controls: {
                    enabled: true,
                    left: controls.left,
                    right: controls.right,
                    pace: 500
                }
            });
        });
    </script>
</body>
</html>
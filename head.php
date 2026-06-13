<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Mother of Orphans | <?php echo $page; ?></title>

    <!-- DNS Prefetch & Preconnect for Performance -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link rel="shortcut icon" href="images/favicon.png" type="image/x-icon">
    <link rel="icon" href="images/favicon.png" type="image/x-icon">

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css?family=Prata|Rubik:400,500,700&display=swap" rel="stylesheet">

    <!-- Stylesheets -->
    <link href="css/bootstrap.css" rel="stylesheet">
    <link href="css/jquery-ui.css" rel="stylesheet">
    <link href="css/swiper.min.css" rel="stylesheet">
    <link href="css/flaticon.css" rel="stylesheet">
    <link href="css/font-awesome.css" rel="stylesheet">
    <link href="css/animate.css" rel="stylesheet">
    <link href="css/custom-animate.css" rel="stylesheet">
    <link href="css/jquery.fancybox.min.css" rel="stylesheet">
    <link href="css/owl.css" rel="stylesheet">
    <link href="css/style.css" rel="stylesheet">
    <link href="css/responsive.css" rel="stylesheet">

    <!-- Responsive Meta (accessible: allow zoom) -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?php echo $description; ?>">
    <meta name="keywords" content="charity,orphans,help,Uganda,donate">

    <!-- Open Graph / Social -->
    <meta property="og:title" content="Mother of Orphans | <?php echo $page; ?>">
    <meta property="og:description" content="<?php echo $description; ?>">
    <meta property="og:image" content="https://motheroforphans.org/images/logo.png">
    <meta property="og:url" content="https://motheroforphans.org/<?php echo basename($_SERVER['PHP_SELF']); ?>">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">

    <!--[if lt IE 9]><script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.js"></script><![endif]-->
    <!--[if lt IE 9]><script src="js/respond.js"></script><![endif]-->
</head>

<body>

    <div class="page-wrapper">
        <!-- Preloader (lightweight) -->
        <div class="loader-wrap" aria-hidden="true">
            <div class="preloader"></div>
            <div class="layer layer-one"><span class="overlay"></span></div>
            <div class="layer layer-two"><span class="overlay"></span></div>
            <div class="layer layer-three"><span class="overlay"></span></div>
        </div>


        <?php include "header.php"; ?>
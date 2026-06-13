<?php
// header.php - Shared navigation header for all pages
// Included after head.php, provides full header with all nav variants
?>
<!-- Main Header-->
<header class="main-header">
    <!-- Top bar -->
    <div class="top-bar theme-bg">
        <div class="auto-container">
            <div class="wrapper-box">
                <div class="left-content">
                    <div class="language-switcher">
                        <div class="languages">
                            <span class="current" title="English">En</span>
                            <span class="hover">English</span>
                        </div>
                    </div>
                    <div class="text">We only have what we give... <a href="#" class="donate-box-btn">Donate Now.</a></div>
                </div>
                <div class="right-content">
                    <ul class="contact-info">
                        <li><span class="flaticon-mail"></span><a href="mailto:info@shaniakigozimotheroforphans.org">info@shaniakigozimotheroforphans.org</a></li>
                        <li><span class="flaticon-phone"></span><a href="tel:+256786224398">+256 786 224 398</a></li>
                    </ul>
                    <ul class="social-icon-one">
                        <li><a href="#" aria-label="Facebook"><span class="fa fa-facebook"></span></a></li>
                        <li><a href="#" aria-label="Twitter"><span class="fa fa-twitter"></span></a></li>
                        <li><a href="#" aria-label="Skype"><span class="fa fa-skype"></span></a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <!-- Header Upper (Desktop Navigation) -->
    <div class="header-upper">
        <div class="auto-container">
            <div class="wrapper-box">
                <div class="logo-column">
                    <div class="logo-box">
                        <div class="logo"><a href="index.php"><img src="images/logo.png" alt="Mother of Orphans" title="Mother of Orphans"></a></div>
                    </div>
                </div>
                <div class="right-column">
                    <div class="option-wrapper">
                        <div class="nav-outer">
                            <nav class="main-menu navbar-expand-xl navbar-dark">
                                <div class="collapse navbar-collapse">
                                    <ul class="navigation">
                                        <li<?php if ($page == 'Home') echo ' class="current"'; ?>><a href="index.php">Home</a></li>
                                            <li<?php if ($page == 'About us') echo ' class="current"'; ?>><a href="about-us.php">About</a></li>
                                                <li<?php if ($page == 'Causes') echo ' class="current"'; ?>><a href="causes.php">Causes</a></li>
                                                    <li<?php if ($page == 'Events') echo ' class="current"'; ?>><a href="events.php">Events</a></li>
                                                        <li<?php if ($page == 'Gallery') echo ' class="current"'; ?>><a href="gallery/">Gallery</a></li>
                                                            <li<?php if ($page == 'Contact us') echo ' class="current"'; ?>><a href="contact.php">Contact</a></li>
                                    </ul>
                                </div>
                            </nav>
                        </div>
                        <div class="navbar-btn-wrap">
                            <button class="theme-btn btn-style-one donate-box-btn"><span>Donate</span></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Sticky Header -->
    <div class="sticky-header">
        <div class="auto-container">
            <div class="wrapper-box">
                <div class="logo-column">
                    <div class="logo-box">
                        <div class="logo"><a href="index.php"><img src="images/logo.png" alt="Mother of Orphans" title="Mother of Orphans"></a></div>
                    </div>
                </div>
                <div class="menu-column">
                    <div class="nav-outer">
                        <div class="nav-inner">
                            <nav class="main-menu navbar-expand-xl navbar-dark">
                                <div class="collapse navbar-collapse">
                                    <ul class="navigation"></ul>
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
                <div class="navbar-btn-wrap">
                    <button class="theme-btn btn-style-one donate-box-btn"><span>Donate</span></button>
                </div>
            </div>
        </div>
    </div>

    <!-- Mobile Menu -->
    <div class="mobile-menu style-one">
        <div class="menu-box">
            <div class="logo"><a href="index.php"><img src="images/logo.png" alt="Mother of Orphans"></a></div>
            <nav class="main-menu navbar-expand-xl navbar-dark">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="flaticon-menu"></span>
                    </button>
                </div>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul class="navigation"></ul>
                </div>
            </nav>
        </div>
    </div>

    <div class="nav-overlay">
        <div class="cursor"></div>
        <div class="cursor-follower"></div>
    </div>
</header>
<!-- End Main Header -->
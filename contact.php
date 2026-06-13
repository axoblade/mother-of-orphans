<?php 
$page = "Contact us";
$description = "Mother of Orphans is located at Makindye Luwafu, after Nankulabye Medical Center, Kampala (U)";
include "head.php";
?>
    <!-- Page Title -->
    <section class="page-title" style="background-image:url(images/background/bg-13.jpg)">
        <div class="auto-container">
            <div class="content-box">
                <h1>Get in Touch With Us</h1>
                <ul class="bread-crumb">
                    <li><a class="home" href=""><span class="fa fa-home"></span></a></li>
                    <li>Contact</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- Contact Form -->
    <section class="contact-form-section">
        <div class="auto-container">
            <div class="row">
                <div class="col-lg-8">
                    <div class="default-form-area">
                        <div class="sec-title">
                            <h1>Do not hesitate to get in touch with us</h1>
                        </div>
                        <form id="contact-form" name="contact_form" class="contact-form" action="" method="post">
                            <div class="row clearfix">
                                <div class="col-lg-6 col-md-6 column">        
                                    <div class="form-group">
                                        <input type="text" name="form_name" class="form-control" value="" placeholder="Name" required="">
                                    </div>
                                </div>
                                <div class="col-lg-6 col-md-6 column">
                                    <div class="form-group">
                                        <input type="email" name="form_email" class="form-control required email" value="" placeholder="Email" required="">
                                    </div>
                                </div>
                                <div class="col-lg-6 col-md-6 column">        
                                    <div class="form-group">
                                        <input type="text" name="form_phone" class="form-control" value="" placeholder="Phone" required="">
                                    </div>
                                </div>
                                <div class="col-lg-6 col-md-6 column">        
                                    <div class="form-group">
                                        <input type="text" name="form_subject" class="form-control" value="" placeholder="Subject" required="">
                                    </div>
                                </div>
                                <div class="col-lg-12 col-md-12 column">
                                    <div class="form-group">
                                        <textarea name="form_message" class="form-control textarea required" placeholder="Message...."></textarea>
                                    </div>
                                    <div class="form-group flex-box">
                                        <div class="submit-btn">
                                            <input id="form_botcheck" name="form_botcheck" class="form-control" type="hidden" value="">
                                            <button class="theme-btn btn-style-one" type="submit" data-loading-text="Please wait..."><span>Send Message</span></button>
                                        </div>
                                        <span class="hint">*Get answers to common questions through our help center.</span>
                                    </div>
                                </div>                                            
                            </div>
                        </form>
                    </div>
                </div>
               <div class="col-lg-4">
                    <div class="contact-info-three">
                        <div class="single-info">
                            <h4>Global HQ</h4>
                            <div class="text">Makindye Luwafu after Nankulabye Medical Center, Kampala (U)</div>
                            <a class="link-btn" href="#">Get Directions</a>                            
                        </div>
                        <div class="single-info">
                            <h4>Quick Contact</h4>
                            <div class="wrapper-box">
                                <a href="mailto:info@motheroforphans.org">info@motheroforphans.org</a> <br>
                                <a href="tel:+256701574447">+256-701-574-447</a>
                            </div>
                            <!--<a class="link-btn" href="#">Get Call Back</a>-->
                        </div>
                    </div>
                </div>
            </div>                    
        </div>
    </section>

    <?php include 'footer.php'; ?>
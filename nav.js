$("#navbarSupportedContent ul .submenu > a").append('<span class="submenu-button"></span>');

//To prevent menu close on click in submenu
$(".submenu ul li").click(function(e){
    e.stopPropagation();
});

$(".submenu").click(function(e){
    if($(this).hasClass("active")){
        $("#navbarSupportedContent ul li").removeClass('active');
        $('#navbarSupportedContent ul li ul').slideUp();
    }else{
        $("#navbarSupportedContent ul li").removeClass('active');
        $("#navbarSupportedContent ul li ul").slideUp();
        $(this).addClass("active");
        $(this).find('ul').stop().slideToggle();
        e.stopPropagation();
    }
    $("#navbarSupportedContent ul li").removeClass('openSub');
    $(this).addClass('openSub');

});

// Close menu when click outside the navbar
$("body, html").click(function(){
    $("#navbarSupportedContent ul li").removeClass('active openSub');
    $('#navbarSupportedContent ul li ul').slideUp();
});

//Open Toggle-menu when in media query
$("#nav-toggle").click(function(e){
    if($("#navbarSupportedContent").hasClass('collapse')) {

        $("#nav-toggle").attr("aria-expanded","true");
        $("#nav-toggle").removeClass('collapsed')
        $("#navbarSupportedContent").addClass('show')
        $("#navbarSupportedContent").removeClass('collapse')


    } else {
        $("#nav-toggle").attr("aria-expanded","false");
        $("#nav-toggle").addClass('collapsed')
        $("#navbarSupportedContent").removeClass('show')
        $("#navbarSupportedContent").addClass('collapse')
    }

});

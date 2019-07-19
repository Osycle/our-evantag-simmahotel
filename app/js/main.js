"use strict";



(function() {
	$(function() {





		//Основной Слайдер
		window.slidermain = $(".slidermain-items").flickity({
			imagesLoaded: true,
			autoPlay: 3000,
			pauseAutoPlayOnHover: false,
			//arrowShape: arrowStyle,
			initialIndex: 0,
			prevNextButtons: false,
			draggable: false,
			wrapAround: true,
			friction: 1,
			selectedAttraction: 1,
			pageDots: false,
			contain: false,
			percentPosition: true,
			cellSelector: 'figure',
			cellAlign: "center"
		});
		slidermain.data("flickity");



		window.startParseInterval = setInterval(function(){
			if ( typeof bob == "undefined" ) window.bob = true;
			if (bob){
				if($(Pic.slideItemClass).length == 1){
					bob = false;
					Pic.parser({
						success: function(){
							bob = true;
							console.info("clearInterval Parsing");
						}
					})
				}
				else
					clearInterval(startParseInterval);
			}
		}, 1000);

		function changeDesc(currentSlide){
			var username = currentSlide.attr("data-username");
			var avatar = currentSlide.attr("data-avatar");
			$(".person-name").text("@"+username).hide().fadeIn(800);
			$(".person-img img").attr("src", avatar).hide().fadeIn(800);
			$(".caption").text(currentSlide.find(".slide-caption").text()).hide().fadeIn(800);
		}

		function stepSlide(currentSlide){

			currentSlide.addClass("is-shown");

			var slides = $(Pic.slideItemClass);
			var currentIndex = Pic.currentSlide.index();
			var lastIndex = slides.eq( $(Pic.slideItemClass).length-1 ).index() ;
			var slidesLength = $(Pic.slideItemClass).length;


			changeDesc(currentSlide);
			textLimit();

			// Запрос на картинки
			Pic.parser({
				success: function(){
					if( Pic.responseError ){
						Pic.selectNewSlide();
					}
				}
			}); 
			// if( 3 <= slidesLength ){
			// 	if(slides.filter(".simple").length != 0)
			// 		slides.filter(".simple").remove();
			// 	console.log(slides.filter(".simple"));
			// }
			if( Pic.maxLenght <= slidesLength ){
				slidermain.flickity('remove', slides.eq(0)); // Удаление элементов слейдера
			}
		}
		

		// События смены слайды
		

		// Случайное число
		function IntRandom(){
			return Math.round((Math.random() * 1e12))
		}

		slidermain.on( 'select.flickity', function( event ) {
			if( typeof figurePrevId == "undefined" )
				window.figurePrevId = 0;

			var currentSlide = $(Pic.slideItemClass).filter(".is-selected");
			Pic.currentSlide = currentSlide;
			var rand = IntRandom();
			var selectId = currentSlide.attr( Pic._attrFigureId );
			
			if ( selectId && selectId == figurePrevId )
				return;

			currentSlide.attr(Pic._attrFigureId, rand);
			figurePrevId = currentSlide.attr(Pic._attrFigureId);
			stepSlide(currentSlide);

		});


		window.Pic = {

			slideItemClass: ".slider-item", // Класс для элементов слайдера
			url: "http://192.168.0.120/modules/getMedias.php", // Адрес запроса (http://192.168.0.125/modules/getMedias.php)
			//url: "instagramData.html",
			maxLenght:  5, // Максимальное кол-во элементов в слайдере
			inc: 0,
			currentSlide: undefined,
			responseError: 0,
			_attrFigureId: "figure-id",


			appendTemplate:  function (data) {
				console.log(  );
				if( ""+data == "null" )
					return;
				data = data[0];
				var newTemp = this.template	.replace(/{id-data}/gim, data.mediaId)
																		.replace(/{figureIdRandom}/gim, IntRandom())
																		.replace(/{avatar}/gim, data.avatar)
																		.replace(/{username}/gim, data.username)
																		.replace(/{caption}/gim, data.caption)
																		.replace(/{img}/gim, data.mediaUrl);
			  slidermain.flickity( 'append', $(newTemp) );

			},

			parser: function(obj){
				var that = this;
				$.ajax({
					type: "POST",
					url: that.url,
					data: {
						inc: that.inc
					},
					success: function(data){

						try{
							data = JSON.parse(data)
							if( data == null ){
							 	that.responseError = true;
							}
						}catch(err){
							Pic.responseError = true;
							slidermain.flickity('playPlayer'); // Запуск слайдера при отсутствии JSON данных
							return;
						}
						// $(data).map(function( i, el ){
						// });

						that.appendTemplate( data ); // Вставка в слайдер

						slidermain.flickity('playPlayer'); // Запуск слайдера
						that.inc++;

						if( typeof obj.success == "function" ) obj.success(); //callback

					},
					statusCode: {
						404: function(){ alert( "По адресу: " + Pic.url + " Страницы не найдена" ); }
					},
					complete: function(response){
						if( typeof obj.complete == "function" ) obj.complete(); //callback
						if( response.statusText == "error"){
							Pic.responseError = true;
						}
					}
				});
			},
			selectNewSlide: function (){
				var newSlide = $(Pic.slideItemClass).filter(":not(.is-shown)");
				if(newSlide.length != 0){
					Pic.selectSlide(newSlide);
					Pic.responseError = false;
				}
			},
			selectSlide: function ( el ) {
				var index = slidermain.find(el).eq(0).index();
				slidermain.flickity( 'select', index );
			}	
		}
		Pic.template = 						
									'<figure class="slider-item" data-avatar="{avatar}" data-username="{username}" id-data="{id-data}" ' + Pic._attrFigureId + '="{figureIdRandom}" >'+
										'<div class="img-content">'+
											'<div class="img-wrapper">'+
												'<div class="img" style="background-image: url(\'{img}\');"></div>'+
												'<div class="img mirror" style="background-image: url(\'{img}\');"></div>'+
											'</div>'+
										'</div>'+
										'<div class="slide-caption hide">'+
											"{caption}"+
										'</div>'+
									'</figure>';

















		function onLoaded() {
			$(window).trigger("resize");
		}

		//Лимит текста
		window.textLimit = function (){
			$("[data-text-limit]").map(function( i, el ){
				el = $(el);
				var text = el.text();
				var textLimit = el.attr("data-text-limit");

				if( text.length > textLimit*1 ){
					text = text.substring(0, textLimit )
					el.text( text+ " ..." );
				}
			})
		}

		//SCROLL
		$(window).on("scroll", function(e) {
			//body...
		});
		$(window).trigger("scroll");





		window.pageAdaptive = function(widthClass, heightClass){

			var winWidth = window.innerWidth;
			var winHeight = window.innerHeight;

			var widthClass = $(widthClass) || null;
			var heightClass = $(heightClass) || null;

			var boxWidth = $(widthClass).width();
			var boxHeight = $(heightClass).height();

			var scale;
			var scaleH = winWidth / boxWidth;
			var scaleV = winHeight / boxHeight;	

		 	var boxHeightOrigin = boxHeight * scaleH;

			if( boxHeightOrigin < winHeight)
				scale = scaleH;
			else
				scale = scaleV;
				
			widthClass.css({
				transform: "scale(" + scale + ")"
			});

		
		}
		pageAdaptive(".page-content-size", ".page-wedding .page-wrapper");


		$(window).on("resize", function(){
			pageAdaptive(".page-content-size", ".page-wedding .page-wrapper");
		})

	});
})(jQuery);

var isWebkit = /Webkit/i.test(navigator.userAgent),
		isChrome = /Chrome/i.test(navigator.userAgent),
		isMac = /Mac/i.test(navigator.userAgent),
		isMobile = !!("ontouchstart" in window),
		isAndroid = /Android/i.test(navigator.userAgent),
		isEdge = /Edge/i.test(navigator.userAgent);


// COMMON FUNCTION

function checkSm() {
	return $(document).width() <= 991;
}

function checkMd() {
	return $(document).width() < 1199 && !checkSm();
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomIntFloat(min, max) {
	return Math.random() * (max - min) + min;
}






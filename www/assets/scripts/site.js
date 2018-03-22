/*  ___
   /   |  ____  ____
  / /| | / __ \/ __ \
 / ___ |/ /_/ / /_/ /
/_/  |_/ .___/ .___/
      /_/   /_/ */
/* ---------------------------------------------------------------------------------------------- */

App = Ladybug.Scarlet.Application.extend({
	controllers: {},
	user: null,
	bearer: null,
	zid: null,
	activeCategory: null,
	activeOffer: null,
	months: null,
	constants: {
		siteUrl: 'http://todoofertasapp.com'
	},
	apiCredentials: {
		AppUid:'61d7398f8f13640ab7b8b0d1cc3196e5',
		AppToken:'61d7398f8f13640ab7b8b0d1cc3196e5.c01fe0e1c4931555730c4015be7972270065d6cdcc2709d208a01ad71ebf749d'
	},
	init: function(options) {
		var obj = this;
		obj.parent(options);
		obj.defaultController = 'app';

		//Checking cookies and local storage
		if(window.localStorage.getItem('user')) {
			obj.user = JSON.parse(window.localStorage.getItem('user'));
		} else {
			obj.user = Cookies.get('user');
		}

		obj.bearer = window.localStorage.getItem('bearer') || Cookies.get('bearer');
		obj.zid = Cookies.get('zid');

		obj.controllers.appController = new AppController();
		obj.controllers.sessionController = new SessionController();

		obj.pushController('app', obj.controllers.appController);
		obj.pushController('session', obj.controllers.sessionController);

		document.addEventListener('deviceready', obj.onDeviceReady, false);

		obj.months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
	},
	checkBearer: function() {
		return !! app.bearer;
	},
	onDeviceReady: function() {
		console.log('onDeviceReady fired!');
	},
	ajaxCall: function(options) {
		var opts = _.defaults(options, {
				data: {},
				success: false,
				error: false,
				complete: false,
				errorMsg: 'Ha ocurrido un error, por favor intenta nuevamente más tarde'
			});
		if (! opts.data.bearer ) {
			opts.data.bearer = app.bearer || '';
		}
		$.ajax({
			url: 'http://todoofertasapp.com/api/' + opts.endpoint + '?token=' + app.apiCredentials.AppToken,
			type: opts.type,
			data: opts.data,
			dataType: 'json',
			success: function(response) {
				if (opts.complete) {
					opts.complete(response);
				}
				if (response && response.result == 'success') {
					if (opts.success) {
						opts.success(response.data);
					}
				} else {
					if (opts.error) {
						//opts.error(app.errorString(response.message) || opts.errorMsg);
						opts.error(response.message || opts.errorMsg);
					} else {
						//$.alert(app.errorString(response.message) || opts.errorMsg);
						$.alert(response.message || opts.errorMsg);
					}
				}
			}
		});
	},
	onDomReady: function() {
		var obj = this;
		obj.router.start();

		$.extend(true, $.alert.defaults, {
			markup: '<div class="alert-overlay"><div class="valign-wrapper"><div class="valign"><div class="alert"><div class="alert-message">{message}</div><div class="alert-buttons"></div></div></div></div></div>',
			buttonMarkup: '<button class="button button-primary"></button>',
			buttons: [
				{ text: 'Aceptar', action: $.alert.close }
			]
		});

		$('body').on('click', '.app-menu .menu-item', function(event) {
			var el = $(this);
			el.siblings('.menu-item').removeClass('selected');
			el.addClass('selected');
		});

		$('body').on('click', '.js-back', function(event) {
			event.preventDefault();
			window.history.back();
		});

		$('body').on('click', '.js-filtros', function(event) {
			event.preventDefault();
			$('.category-filtros').toggleClass('open');
		});

		$('body').on('click', '.js-open-app-nav-menu', function(event) {
			event.preventDefault();
			$('.app-nav-menu').velocity('transition.slideUpIn', { duration: 350, display: 'flex' });
		});

		$('body').on('click', '.app-nav-menu', function(event) {
			event.preventDefault();
			$('.app-nav-menu').velocity('transition.slideDownOut', { duration: 350 });
		});

		$('body').on('click', '.app-nav-menu *', function(event) {
			event.stopPropagation();
		});

		$('body').on('click', '.app-nav-menu a', function(event) {
			event.preventDefault();
			var el = $(this),
				href = el.attr('href');
				$('.app-nav-menu').velocity('transition.slideLeftOut', { duration: 350, complete: function() {
					obj.router.navigate(href);
				} });
		});

		$('body').on('click', '.js-favorite', function(event) {
			event.preventDefault();
			var el = $(this),
				offerId = el.data('offer-id'),
				fa = el.find('fa'),
				action = el.hasClass('added') ? 'remove' : 'add';

			app.ajaxCall({
				endpoint: 'users/favorite',
				type: 'post',
				data: { id_offer: offerId, action: action },
				success: function(response) {
					el.toggleClass('added');
				}
			});
		});
	},
	runVelocity: function(elements, complete) {
		var obj = this,
			complete = complete || $.noop,
			elements = elements || $('[data-animate=auto]'),
			pending = elements.length;
		elements.each(function() {
			var el = $(this),
				selector = el.data('selector') || '',
				delay = el.data('delay') || 0,
				duration = el.data('duration') || 700,
				stagger = el.data('stagger') || 0,
				transition = el.data('transition') || 'transition.fadeIn';
			if ( transition.indexOf('transition.') != 0 ) {
				transition = 'transition.' + transition;
			}
			if (selector) {
				el.css({ opacity: 1 });
				el = el.find(selector);
				el.css({ opacity: 0 });
			}
			el.velocity(transition, {
				delay: delay,
				stagger: stagger,
				duration: duration,
				complete: function() {
					pending--;
					if (pending <= 0) {
						complete.call(obj);
					}
				}
			});
		});
	}
});

/*_    ___
 | |  / (_)__ _      _______
 | | / / / _ \ | /| / / ___/
 | |/ / /  __/ |/ |/ (__  )
 |___/_/\___/|__/|__/____/*/
/* ---------------------------------------------------------------------------------------------- */

HeaderView = Ladybug.Scarlet.View.extend({
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#partial-header');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-header');
		target.html( obj.templates.base() );
	}
});

/* ---------------------------------------------------------------------------------------------- */

FooterView = Ladybug.Scarlet.View.extend({
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#partial-footer');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-footer');
		target.html( obj.templates.base() );
	}
});

/* ---------------------------------------------------------------------------------------------- */

MenuView = Ladybug.Scarlet.View.extend({
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#partial-menu');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-nav-menu');
		target.html( obj.templates.base() );
	}
});

/* ---------------------------------------------------------------------------------------------- */

LoginView = Ladybug.Scarlet.View.extend({
	animate: true,
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#section-login');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-content');
		target.html( obj.templates.base() );
		target.attr('class', 'app-content ' + app.slug + ' ' + app.action);

		$('.app-footer').slideUp(100);
		$('.app-nav-menu').hide();

		if(app.user) {
			console.log(app.user.email);
			$('#email').val(app.user.email);
		}

		$('.button-facebook').on('click', function(event) {
			event.preventDefault();
			console.log('Facebook Login');

			facebookConnectPlugin.login(
				['public_profile', 'email'],
				function() {

					console.log('facebookConnectPlugin success');
				},
				function() {

					console.log('facebookConnectPlugin error');
				}
			);
		});

		app.runVelocity( target.find('[data-animable=auto]') );

		var form = $('#form-login');

		form.on('submit', function(event) {
			event.preventDefault();
			console.log(form.serializeObject());
			form.validate({
				callbacks: {
					fail: function(field, type, message) {
						field.closest('.form-group').addClass('has-error');
						field.on('focus', function() {
							field.closest('.form-group').removeClass('has-error');
							field.off('focus');
						});
					},
					success: function() {
						var data = form.serializeObject();
						form.find('input, select').prop({ disabled: true });
						form.find('button[type=submit]').prop({ disabled: true }).loading({ text: 'Enviando...' });

						app.ajaxCall({
							endpoint: 'users/sign-in',
							type: 'post',
							data: data,
							error: function(message) {
								form.find('input, select').prop({ disabled: false });
								form.find('button[type=submit]').prop({ disabled: false }).loading('done');

								$.alert(message);
							},
							success: function(response) {
								form.trigger('reset');
								form.find('input, select').prop({ disabled: false });
								form.find('button[type=submit]').prop({ disabled: false }).loading('done');

								Cookies.set('user', response.user);
								Cookies.set('bearer', response.bearer);

								console.log(response.user);

								window.localStorage.setItem('user', JSON.stringify(response.user));
								window.localStorage.setItem('bearer', response.bearer);

								app.user = response.user;
								app.bearer = response.bearer;
								app.router.navigate('#!/session/categories');
							}
						});

					},
					error: function(fields) {
						$.alert('Por favor llena todos los campos requeridos');
					}
				}
			});
		});
	}
});

/* ---------------------------------------------------------------------------------------------- */

RecoverView = Ladybug.Scarlet.View.extend({
	animate: true,
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#section-recover');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-content');
		target.html( obj.templates.base() );
		target.attr('class', 'app-content ' + app.slug + ' ' + app.action);

		app.runVelocity( target.find('[data-animable=auto]') );

		var form = $('#form-recover');

		form.on('submit', function(event) {
			event.preventDefault();
			console.log(form.serializeObject());
			form.validate({
				callbacks: {
					fail: function(field, type, message) {
						field.closest('.form-group').addClass('has-error');
						field.on('focus', function() {
							field.closest('.form-group').removeClass('has-error');
							field.off('focus');
						});
					},
					success: function() {
						var data = form.serializeObject();
						form.find('input, select').prop({ disabled: true });
						form.find('button[type=submit]').prop({ disabled: true }).loading({ text: 'Enviando...' });

						app.ajaxCall({
							endpoint: 'users/recover',
							type: 'post',
							data: data,
							error: function(message) {
								form.find('input, select').prop({ disabled: false });
								form.find('button[type=submit]').prop({ disabled: false }).loading('done');
								$.alert(message);
							},
							success: function(response) {
								form.trigger('reset');
								form.find('input, select').prop({ disabled: false });
								form.find('button[type=submit]').prop({ disabled: false }).loading('done');
								$.alert(response.message || 'Hemos enviado un correo electrónico para activar tu cuenta.');
								app.router.navigate('#!/app');
							}
						});

					},
					error: function(fields) {
						$.alert('Introduce tu correo electrónico');
					}
				}
			});
		});
	}
});

/* ---------------------------------------------------------------------------------------------- */

RegisterView = Ladybug.Scarlet.View.extend({
	animate: true,
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#section-register');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-content');
		target.html( obj.templates.base() );
		target.attr('class', 'app-content ' + app.slug + ' ' + app.action);

		app.runVelocity( target.find('[data-animable=auto]') );

		console.log();

		$('#fecha_nacimiento').on('focus', function(event) {
			var el = $(this),
				val = el.val();

			if(val) { dateElements = val.split('/'); }

			el.prop('type', 'date');

			if(val) {
				console.log(dateElements[0] + '-' + dateElements[1] + '-' + dateElements[2]);
				el.val(dateElements[2] + '-' + dateElements[1] + '-' + dateElements[0]);
			}
		});

		$('#fecha_nacimiento').on('blur', function(event) {
			var el = $(this),
				val = el.val();

			if(val) { dateElements = val.split('-'); }

			el.prop('type', 'text');

			if(val) { el.val(dateElements[2] + '/' + dateElements[1] + '/' + dateElements[0]); }
		});

		var form = $('#form-registro');

		form.on('submit', function(event) {
			event.preventDefault();
			console.log(form.serializeObject());
			form.validate({
				callbacks: {
					fail: function(field, type, message) {
						field.closest('.form-group').addClass('has-error');
						field.on('focus', function() {
							field.closest('.form-group').removeClass('has-error');
							field.off('focus');
						});
					},
					success: function() {
						var data = form.serializeObject();
						form.find('input, select').prop('disabled', true);
						form.find('button[type=submit]').prop('disabled', true).loading({ text: 'Enviando...' });

						app.ajaxCall({
							endpoint: 'users/sign-up',
							type: 'post',
							data: data,
							error: function(message) {

								form.find('input, select').prop('disabled', false);
								form.find('button[type=submit]').prop('disabled', false).loading('done');
								$.alert(message);
							},
							success: function(response) {

								form.find('input, select').prop('disabled', false);
								form.find('button[type=submit]').prop('disabled', false).loading('done');
								$.alert(response.message || 'Gracias por registrarte. Hemos enviado un correo electrónico a tu bandeja para que actives tu cuenta.');
								form.trigger('reset');
								app.router.navigate('#!/app');
							}
						});

					},
					error: function(fields) {
						$.alert('Por favor llena todos los campos y acepta los términos y condiciones para registrarte.');
					}
				}
			});
		});
	}
});

/* ---------------------------------------------------------------------------------------------- */

CategoriesView = Ladybug.Scarlet.View.extend({
	animate: true,
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#section-categories');
		obj.templates.list = Ladybug.Utils.compileTemplate('#section-categories-list');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-content');
		target.html( obj.templates.base() );
		target.attr('class', 'app-content ' + app.slug + ' ' + app.action);

		$('.app-footer').slideDown(100);

		app.runVelocity( target.find('[data-animable=auto]') );

		/*app.ajaxCall({
			endpoint: 'categories/all',
			success: function(response) {

				obj.renderList(response.categories || []);
			}
		});*/
	},
	renderCategories: function(list) {
		var obj = this,
			target = $('.block-content-area');
		target.html( obj.templates.list({ categories: list, constants: app.constants }) );
		$('.category').velocity('transition.slideUpIn');
	}
});

/* ---------------------------------------------------------------------------------------------- */

CategoryView = Ladybug.Scarlet.View.extend({
	animate: true,
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#section-category');
		obj.templates.list = Ladybug.Utils.compileTemplate('#section-category-offers');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-content');
		target.html( obj.templates.base() );
		target.attr('class', 'app-content ' + app.slug + ' ' + app.action);

		app.runVelocity( target.find('[data-animable=auto]') );
	},
	renderOffers: function(response) {
		var obj = this,
			target = $('.category-offers');

		$('.section-title h2').text(response.category.name).hide().fadeIn();
		app.activeCategory = response.category.name;

		target.html( obj.templates.list({ offers: response.offers }) );
		$('.oferta').velocity('transition.slideUpIn');
	}
});

/* ---------------------------------------------------------------------------------------------- */

OfertaView = Ladybug.Scarlet.View.extend({
	animate: true,
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#section-oferta');
		obj.templates.single = Ladybug.Utils.compileTemplate('#section-oferta-single');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-content');
		target.html( obj.templates.base() );
		target.attr('class', 'app-content ' + app.slug + ' ' + app.action);

		app.runVelocity( target.find('[data-animable=auto]') );
	},
	renderOffer: function(response) {
		var obj = this,
			target = $('.the-offer');

		$('.section-title h2').text(app.activeCategory).hide().fadeIn();
		target.html( obj.templates.single({ offer: response }) );
		$('.the-offer').velocity('transition.slideUpIn');

		$('.price-tag').html('$' + response.price);

		var endDate = new Date(response.end_date),
			todayDate = new Date(),
			timeDiff = Math.abs(endDate.getTime() - todayDate.getTime()),
			diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

		$('.oferta-deadline p').html('Esta oferta termina el ' + endDate.getDate() + '<span>/</span>' + (endDate.getMonth()+1) + '<span>/</span>' + endDate.getFullYear() + ' (en ' + diffDays + ' día' + (diffDays == 1 ? '' : 's') + ' )');

		$('.js-compra-oferta').attr('href', '#!/session/compra-oferta/' + response.id);
	}
});

/* ---------------------------------------------------------------------------------------------- */

CompraOfertaView = Ladybug.Scarlet.View.extend({
	animate: true,
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#section-compra-oferta');
		obj.templates.single = Ladybug.Utils.compileTemplate('#section-compra-oferta-single');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-content');
		target.html( obj.templates.base() );
		target.attr('class', 'app-content ' + app.slug + ' ' + app.action);

		$('.metodo-pago').hide();
		app.runVelocity( target.find('[data-animable=auto]') );
	},
	renderOffer: function(response) {
		var obj = this,
			target = $('.the-offer');



		app.activeOffer = response.id;
		target.html( obj.templates.single({ offer: response }) );
		$('.the-offer').velocity('transition.slideUpIn');
		$('.metodo-pago').velocity('transition.slideUpIn', { delay: 600 });

		$('.js-pago-tarjeta').attr('href', '#!/session/pago-tarjeta/' + response.id);
		$('.js-pago-efectivo').attr('href', '#!/session/pago-efectivo/' + response.id);
	}
});

/* ---------------------------------------------------------------------------------------------- */

CompraGraciasView = Ladybug.Scarlet.View.extend({
	animate: true,
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#section-compra-gracias');
		obj.templates.single = Ladybug.Utils.compileTemplate('#section-compra-gracias-single');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-content');
		target.html( obj.templates.base() );
		target.attr('class', 'app-content ' + app.slug + ' ' + app.action);

		app.runVelocity( target.find('[data-animable=auto]') );
	},
	renderOffer: function(response) {
		var obj = this,
			target = $('.the-offer');

		app.activeOffer = response.id;
		target.html( obj.templates.single({ offer: response }) );
		$('.the-offer').velocity('transition.slideUpIn');
	}
});

/* ---------------------------------------------------------------------------------------------- */

PagoTarjetaView = Ladybug.Scarlet.View.extend({
	animate: true,
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#section-pago-tarjeta');
		obj.templates.single = Ladybug.Utils.compileTemplate('#section-pago-tarjeta-single');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-content');
		target.html( obj.templates.base() );
		target.attr('class', 'app-content ' + app.slug + ' ' + app.action);

		app.runVelocity( target.find('[data-animable=auto]') );

		OpenPay.setSandboxMode(true);
		OpenPay.setId('mi1s7jqzmdnuny1uubmq');
		OpenPay.setApiKey('pk_b4c8bbe046fd466b9b178a433d5a7dc1');

		var deviceSessionId = OpenPay.deviceData.setup('payment-form', 'device_session_id');

		$('#payment-form').on('submit', function(event) {
			event.preventDefault();
			var el = $(this),
				data = el.serializeObject(),
				buttonPagar = $('.js-pagar');

			console.log(data);

			buttonPagar.prop( 'disabled', true);
			data.offer_id = app.activeOffer;

			OpenPay.token.extractFormAndCreate(
				'payment-form',
				function(response) {
					var token_id = response.data.id;
					$('#token_id').val(token_id);
					data.token_id = token_id;

					console.log(data);

					app.ajaxCall({
						endpoint: 'payments/credit-card',
						type: 'post',
						data: data,
						success: function(response) {
							app.router.navigate('#!/session/compra-gracias/1');
						}
					});
				},
				function(response) {
					var desc = response.data.description != undefined ? response.data.description : response.message;
					$.alert('ERROR [' + response.status + '] ' + desc);
					buttonPagar.prop('disabled', false);
				}
			);
		});
	},
	renderOffer: function(response) {
		var obj = this,
			target = $('.the-offer');

		app.activeOffer = response.id;
		target.html( obj.templates.single({ offer: response }) );
		$('.the-offer').velocity('transition.slideUpIn');
	}
});

/* ---------------------------------------------------------------------------------------------- */

ZonesView = Ladybug.Scarlet.View.extend({
	animate: true,
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#section-zones');
		obj.templates.list = Ladybug.Utils.compileTemplate('#section-zone-list');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-content');
		target.html( obj.templates.base() );
		target.attr('class', 'app-content ' + app.slug + ' ' + app.action);

		app.runVelocity( target.find('[data-animable=auto]') );
	},
	renderCategories: function(list) {
		var obj = this,
			target = $('.zonas .menu');
		target.html( obj.templates.list({ zones: list, constants: app.constants }) );
		$('.block-list .menu-item').velocity('transition.slideUpIn');

		$('.menu-item a').on('click', function(event) {
			event.preventDefault();
			var el = $(this),
				zid = el.data('zid');

			Cookies.set('zid', zid);
			app.zid = zid;
			app.router.navigate('#!/session/categories');
		});
	}
});

/* ______            __             ____
  / ____/___  ____  / /__________  / / /__  __________
 / /   / __ \/ __ \/ __/ ___/ __ \/ / / _ \/ ___/ ___/
/ /___/ /_/ / / / / /_/ /  / /_/ / / /  __/ /  (__  )
\____/\____/_/ /_/\__/_/   \____/_/_/\___/_/  /____/*/
/* ---------------------------------------------------------------------------------------------- */

BaseController = Ladybug.Scarlet.Controller.extend({
	views: {},
	view: null,
	onInit: function() {
		var obj = this;
	},
	onEnter: function(params, callback) {
		var obj = this;
		callback.call(obj);
	},
	onExit: function(callback) {
		var obj = this;
		callback.call(obj);
	},
	setActiveView: function(view, callback) {
		var obj = this;

		var afterExitView = function() {
			view.render();
			$('.js-section-current').velocity('transition.slideRightIn', {
				duration: 350,
				display: 'flex',
				complete: function() {

					if(typeof callback !== 'undefined') {

						callback.call(obj);
					}
				}
			});
			obj.view = view;
		};
		if ( $('.js-section-current').length > 0 ) {

			var content = $('.js-section-current');
			content.velocity({ scale: 0.95, opacity: 0.5 }, {
				duration: 250,
				easing: 'easeOutQuad',
				complete: function() {
					content.velocity({ translateY: 50, opacity: 0 }, {
						duration: 350,
						delay: 100,
						easing: 'easeOutQuad',
						complete: function() {
							afterExitView();
						}
					});
				}
			});
		} else {
			afterExitView();
		}
	}
});

/* ---------------------------------------------------------------------------------------------- */

AppController = BaseController.extend({
	views: {},
	view: null,
	onInit: function() {
		var obj = this;
		obj.pushAction('index', obj.indexAction);
		obj.pushAction('recover', obj.recoverAction);
		obj.pushAction('register', obj.registerAction);
		obj.pushAction('logout', obj.logoutAction);

		obj.parent();
	},
	onEnter: function(params, callback) {
		var obj = this;
		callback.call(obj);
	},
	indexAction: function(id) {
		var obj = this;
		if(app.checkBearer()) {
			app.router.navigate('#!/session/categories');
			return;
		}
		if (! obj.views['login'] ) {
			obj.views.login = new LoginView();
		}
		obj.setActiveView(obj.views.login);
	},
	recoverAction: function(id) {
		var obj = this;
		if(app.checkBearer()) {
			app.router.navigate('#!/session/categories');
			return;
		}

		if (! obj.views['recover'] ) {
			obj.views.recover = new RecoverView();
		}
		obj.setActiveView(obj.views.recover);
	},
	registerAction: function(id) {
		var obj = this;
		if(app.checkBearer()) {
			app.router.navigate('#!/session/categories');
			return;
		}

		if (! obj.views['register'] ) {
			obj.views.register = new RegisterView();
		}
		obj.setActiveView(obj.views.register);
	},
	logoutAction: function() {
		app.bearer = null;
		app.user = null;
		Cookies.remove('user');
		Cookies.remove('bearer');
		window.localStorage.removeItem('bearer');
		app.router.navigate('#!/app');
	}
});

/* ---------------------------------------------------------------------------------------------- */

SessionController = BaseController.extend({
	views: {},
	view: null,
	zone: null,
	onInit: function() {
		var obj = this;
		obj.pushAction('categories', obj.categoriesAction);
		obj.pushAction('category', obj.categoryAction);
		obj.pushAction('oferta', obj.ofertaAction);
		obj.pushAction('compra-oferta', obj.compraOfertaAction);
		obj.pushAction('pago-tarjeta', obj.pagoTarjetaAction);
		obj.pushAction('compra-gracias', obj.compraGraciasAction);
		obj.pushAction('zones', obj.zonesAction);

		//obj.views.header = new HeaderView();
		obj.views.footer = new FooterView();
		obj.views.menu =   new MenuView();

		obj.parent();
	},
	onEnter: function(params, callback) {
		var obj = this;
		callback.call(obj);

		//obj.views.header.render();
		obj.views.footer.render();
		obj.views.menu.render();
		$('.app-nav-menu').hide();
	},
	categoryAction: function(id) {
		var obj = this;
		if(!app.checkBearer()) {
			app.router.navigate('#!/app');
			return;
		}

		if (! obj.views['category'] ) {
			obj.views.category = new CategoryView();
		}
		obj.setActiveView(obj.views.category, function() {
			obj.fetchCategory(id);
		});
	},
	categoriesAction: function(id) {
		var obj = this;
		if(!app.checkBearer()) {
			app.router.navigate('#!/app');
			return;
		}

		if (! obj.views['categories'] ) {
			obj.views.categories = new CategoriesView();
		}
		obj.setActiveView(obj.views.categories, function() {
			obj.fetchCategories();
		});
	},
	ofertaAction: function(id) {
		var obj = this;
		if(!app.checkBearer()) {
			app.router.navigate('#!/app');
			return;
		}

		if(!id) {
			app.router.navigate('#!/session/categories');
			return;
		}

		if (! obj.views['oferta'] ) {
			obj.views.oferta = new OfertaView();
		}
		obj.setActiveView(obj.views.oferta, function() {
			obj.fetchOffer(id);
		});
	},
	compraOfertaAction: function(id) {
		var obj = this;
		if(!app.checkBearer()) {
			app.router.navigate('#!/app');
			return;
		}

		if(!id) {
			app.router.navigate('#!/session/categories');
			return;
		}

		if (! obj.views['compra-oferta'] ) {
			obj.views.compraOferta = new CompraOfertaView();
		}
		obj.setActiveView(obj.views.compraOferta, function() {
			obj.fetchOffer(id);
		});
	},
	compraGraciasAction: function(id) {
		var obj = this;
		if(!app.checkBearer()) {
			app.router.navigate('#!/app');
			return;
		}

		if(!id) {
			app.router.navigate('#!/session/categories');
			return;
		}

		if (! obj.views['compra-gracias'] ) {
			obj.views.compraGracias = new CompraGraciasView();
		}
		obj.setActiveView(obj.views.compraGracias, function() {
			obj.fetchOffer(id);
		});
	},
	pagoTarjetaAction: function(id) {
		var obj = this;
		if(!app.checkBearer()) {
			app.router.navigate('#!/app');
			return;
		}

		if(!id) {
			app.router.navigate('#!/session/categories');
			return;
		}

		if (! obj.views['pago-tarjeta'] ) {
			obj.views.pagoTarjeta = new PagoTarjetaView();
		}
		obj.setActiveView(obj.views.pagoTarjeta, function() {
			obj.fetchOffer(id);
		});
	},
	zonesAction: function(id) {
		var obj = this;
		if(!app.checkBearer()) {
			app.router.navigate('#!/app');
			return;
		}

		if (! obj.views['zones'] ) {
			obj.views.zones = new ZonesView();
		}
		obj.setActiveView(obj.views.zones, function() {

			obj.fetchZones();
		});
	},
	fetchCategories: function() {
		var obj = this;
		app.ajaxCall({
			endpoint: 'categories/all',
			type: 'post',
			data: { id_zone: app.zid },
			success: function(response) {
				obj.view.renderCategories(response.categories || []);
			}
		});
	},
	fetchCategory: function(id) {
		var obj = this;
		app.ajaxCall({
			endpoint: 'categories/category/' + id,
			type: 'post',
			data: { id_zone: app.zid },
			success: function(response) {
				obj.view.renderOffers(response || []);
			}
		});
	},
	fetchOffer: function(id) {
		var obj = this;
		app.ajaxCall({
			endpoint: 'offers/offer/' + id,
			type: 'post',
			success: function(response) {
				obj.view.renderOffer(response.offer || []);
			}
		});
	},
	fetchZones: function() {
		var obj = this;
		app.ajaxCall({
			endpoint: 'zones/all',
			success: function(response) {
				obj.view.renderCategories(response.zones || []);
			}
		});
	},
	checkBearer: function() {
		return !! app.bearer;
	}
});

/* ---------------------------------------------------------------------------------------------- */

var app = new App();
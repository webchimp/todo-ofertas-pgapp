/*  ___
   /   |  ____  ____
  / /| | / __ \/ __ \
 / ___ |/ /_/ / /_/ /
/_/  |_/ .___/ .___/
      /_/   /_/ */
/* ---------------------------------------------------------------------------------------------- */

App = Ladybug.Scarlet.Application.extend({
	controllers: {},
	init: function(options) {
		var obj = this;
		obj.parent(options);
		obj.defaultController = 'app';

		obj.controllers.appController = new AppController();
		obj.controllers.sessionController = new SessionController();

		obj.pushController('app', obj.controllers.appController);
		obj.pushController('session', obj.controllers.sessionController);
	},
	onDomReady: function() {
		var obj = this;
		obj.router.start();

		$('body').on('click', '.app-menu .menu-item', function(event) {
			var el = $(this);
			el.siblings('.menu-item').removeClass('selected');
			el.addClass('selected');
		});

		$('body').on('click', '.js-open-app-nav-menu', function(event) {
			event.preventDefault();
			$('.app-nav-menu').velocity('transition.slideDownIn', { duration: 350, display: 'flex' });
		});

		$('body').on('click', '.app-nav-menu', function(event) {
			event.preventDefault();
			$('.app-nav-menu').velocity('transition.slideLeftOut', { duration: 350 });
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

		app.runVelocity( target.find('[data-animable=auto]') );
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
	}
});

/* ---------------------------------------------------------------------------------------------- */

CategoriesView = Ladybug.Scarlet.View.extend({
	animate: true,
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#section-categories');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-content');
		target.html( obj.templates.base() );
		target.attr('class', 'app-content ' + app.slug + ' ' + app.action);

		$('.app-footer').slideDown(100);

		app.runVelocity( target.find('[data-animable=auto]') );
	}
});

/* ---------------------------------------------------------------------------------------------- */

SingleView = Ladybug.Scarlet.View.extend({
	animate: true,
	onInit: function() {
		var obj = this;
		obj.templates.base = Ladybug.Utils.compileTemplate('#section-single');
	},
	onRender: function() {
		var obj = this,
			target = $('.app-content');
		target.html( obj.templates.base() );
		target.attr('class', 'app-content ' + app.slug + ' ' + app.action);

		app.runVelocity( target.find('[data-animable=auto]') );
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
	setActiveView: function(view) {
		var obj = this;

		var afterExitView = function() {
			view.render();
			$('.js-section-current').velocity('transition.slideRightIn', { duration: 350, display: 'flex' });
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

		obj.parent();
	},
	onEnter: function(params, callback) {
		var obj = this;
		callback.call(obj);
	},
	indexAction: function(id) {
		var obj = this;
		if (! obj.views['login'] ) {
			obj.views.login = new LoginView();
		}
		obj.setActiveView(obj.views.login);
	},
	recoverAction: function(id) {
		var obj = this;
		if (! obj.views['recover'] ) {
			obj.views.recover = new RecoverView();
		}
		obj.setActiveView(obj.views.recover);
	},
	registerAction: function(id) {
		var obj = this;
		if (! obj.views['register'] ) {
			obj.views.register = new RegisterView();
		}
		obj.setActiveView(obj.views.register);
	}
});

/* ---------------------------------------------------------------------------------------------- */

SessionController = BaseController.extend({
	views: {},
	view: null,
	onInit: function() {
		var obj = this;
		obj.pushAction('categories', obj.categoriesAction);
		obj.pushAction('single', obj.singleAction);

		obj.views.header = new HeaderView();
		obj.views.footer = new FooterView();
		obj.views.menu =   new MenuView();

		obj.parent();
	},
	onEnter: function(params, callback) {
		var obj = this;
		callback.call(obj);

		obj.views.header.render();
		obj.views.footer.render();
		obj.views.menu.render();
		$('.app-nav-menu').hide();
	},
	categoriesAction: function(id) {
		var obj = this;
		if (! obj.views['categories'] ) {
			obj.views.categories = new CategoriesView();
		}
		obj.setActiveView(obj.views.categories);
	},
	singleAction: function(id) {
		var obj = this;
		if (! obj.views['single'] ) {
			obj.views.single = new SingleView();
		}
		obj.setActiveView(obj.views.single);
	}
});

/* ---------------------------------------------------------------------------------------------- */

var lbApp = new App();
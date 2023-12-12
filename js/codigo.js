document.addEventListener("DOMContentLoaded", main, false);

// Constantes
const NOMBRE_BD = 'ejemploJS';
const VERSION_BD = 3;
const NOMBRE_NOTAS = 'notas';
const NOMBRE_TAREAS = 'tareas';

// Variables globales
var formularioNotas;
var formularioTareas;
var bNuevaNota;
var bCancelarNota;
var campoTitulo;
var campoContenido;
var campoTarea;
var db;

// Base de datos
function abrirBd() {
	let req = indexedDB.open(NOMBRE_BD, VERSION_BD);
	req.onsuccess = function () {
		db = this.result;
		mostrarNotas();
		mostrarTareas();
	};
	req.onerror = function (evt) {
		console.error("abrirBd:", evt.target.errorCode);
	};

	req.onupgradeneeded = function (evt) {
		let _db = evt.target.result;
		// Notas
		if (!_db.objectStoreNames.contains(NOMBRE_NOTAS)) {
			let _almacenNotas = evt.currentTarget.result.createObjectStore(
				NOMBRE_NOTAS, { keyPath: 'id_nota', autoIncrement: true });

			_almacenNotas.createIndex('titulo', 'titulo', { unique: false });
		}

		// Tareas
		if (!_db.objectStoreNames.contains(NOMBRE_TAREAS)) {
			let _almacenTareas = evt.currentTarget.result.createObjectStore(
				NOMBRE_TAREAS, { keyPath: 'id_tarea', autoIncrement: true });
		}
	};
}

function getAlmacen(_nombreAlmacen, _modo) {
	var transaccion = db.transaction(_nombreAlmacen, _modo);
	return transaccion.objectStore(_nombreAlmacen);
}

function mostrarNotas(_almacen) {
	if (typeof _almacen == 'undefined')
	_almacen = getAlmacen(NOMBRE_NOTAS, 'readonly');

	let _contenedorNotas = document.getElementById('notas');

	let _notas = [...document.getElementsByClassName('nota')];
	_notas.forEach(nota => {
		nota.remove();
	});

	let _promesa;
	_promesa = _almacen.count();

	_promesa.onerror = function() {
		console.error("_almacen.count:", this.error);
	};

	_promesa = _almacen.openCursor();
	_promesa.onsuccess = function(evt) {
		let _cursor = evt.target.result;

		if (_cursor) {
			_promesa = _almacen.get(_cursor.key);
			_promesa.onsuccess = function (evt) {
				let _valor = evt.target.result;
				let _div = document.createElement('div');
				_div.classList.add('nota');
				let _titulo = document.createElement('h3');
				_titulo.innerText = _valor.titulo;
				let _contenido = document.createElement('p');
				_contenido.innerText = _valor.contenido;
				let _bBorrar = document.createElement('button');
				_bBorrar.innerText = 'Borrar';
				_bBorrar.addEventListener("click", () => {
					eliminarNota(_valor.id_nota);
				}, false);
				_bBorrar.classList.add('borrarNota');
				_div.appendChild(_titulo);
				_div.appendChild(_contenido);
				_div.appendChild(_bBorrar);
				_contenedorNotas.appendChild(_div);
			};

			_cursor.continue();
		}
	};
}

function addNota(titulo, contenido) {
	let _nota = { titulo: titulo, contenido: contenido};

	let _almacen = getAlmacen(NOMBRE_NOTAS, 'readwrite');
	let _peticion;
	try {
		_peticion = _almacen.add(_nota);
	} catch (e) {
		throw e;
	}
	_peticion.onsuccess = function () {
		mostrarNotas(_almacen);
	};
	_peticion.onerror = function() {
		console.error(this.error);
	};
}

function eliminarNota(_clave) {
	let _almacen = getAlmacen(NOMBRE_NOTAS, 'readwrite');

	let _peticion = _almacen.get(_clave);
	_peticion.onsuccess = function(evt) {
		let _registro = evt.target.result;
		if (typeof _registro == 'undefined') {
			console.error("eliminarNota:", "Registro no encontrado");
			return;
		}
		let _petEliminar = _almacen.delete(_clave);
		_petEliminar.onsuccess = function() {
			mostrarNotas(_almacen);
		};
		_petEliminar.onerror = function (evt) {
			console.error("eliminarNota:", evt.target.errorCode);
		};
	};
	_peticion.onerror = function (evt) {
		console.error("eliminarNota:", evt.target.errorCode);
	};
}

function mostrarTareas(_almacen) {
	if (typeof _almacen == 'undefined')
	_almacen = getAlmacen(NOMBRE_TAREAS, 'readonly');

	let _contenedorTareas = document.getElementById('tareas');

	let _tareas = [...document.getElementsByClassName('tarea')];
	_tareas.forEach(tarea => {
		tarea.remove();
	});

	let _promesa;
	_promesa = _almacen.count();

	_promesa.onerror = function() {
		console.error("_almacen.count:", this.error);
	};

	_promesa = _almacen.openCursor();
	_promesa.onsuccess = function(evt) {
		let _cursor = evt.target.result;

		if (_cursor) {
			_promesa = _almacen.get(_cursor.key);
			_promesa.onsuccess = function (evt) {
				let _valor = evt.target.result;
				let _tarea = document.createElement('p');
				_tarea.innerText = _valor.tarea;
				_tarea.classList.add('tarea');
				_tarea.addEventListener("click", () => {
					eliminarTarea(_valor.id_tarea);
				}, false);
				_contenedorTareas.appendChild(_tarea);
			};

			_cursor.continue();
		}
	};
}

function addTarea(tarea) {
	let _tarea = { tarea: tarea};

	let _almacen = getAlmacen(NOMBRE_TAREAS, 'readwrite');
	let _peticion;
	try {
		_peticion = _almacen.add(_tarea);
	} catch (e) {
		throw e;
	}
	_peticion.onsuccess = function () {
		mostrarTareas(_almacen);
	};
	_peticion.onerror = function() {
		console.error(this.error);
	};
}

function eliminarTarea(_clave) {
	let _almacen = getAlmacen(NOMBRE_TAREAS, 'readwrite');

	let _peticion = _almacen.get(_clave);
	_peticion.onsuccess = function(evt) {
		let _registro = evt.target.result;
		if (typeof _registro == 'undefined') {
			console.error("eliminarTarea:", "Registro no encontrado");
			return;
		}
		let _petEliminar = _almacen.delete(_clave);
		_petEliminar.onsuccess = function() {
			mostrarTareas(_almacen);
		};
		_petEliminar.onerror = function (evt) {
			console.error("eliminarTarea:", evt.target.errorCode);
		};
	};
	_peticion.onerror = function (evt) {
		console.error("eliminarTarea:", evt.target.errorCode);
	};
}


function main() {
	formularioNotas = document.querySelector('#id_formularioNota');
	formularioTareas = document.querySelector('#id_formularioTarea');
	bNuevaNota = document.querySelector('#id_nuevaNota');
	bCancelarNota = document.querySelector('#id_cancelarNota');
	campoTitulo = document.querySelector('#id_titulo');
	campoContenido = document.querySelector('#id_contenido');
	campoTarea = document.querySelector('#id_tarea');

	// Botones de notas
	bNuevaNota.addEventListener("click", mostrarFormulario, false);
	bCancelarNota.addEventListener("click", mostrarFormulario, false);

	// Formulario nueva nota
	formularioNotas.addEventListener("submit", (e) => {
		e.preventDefault();
		if (validarNotas()) {
			addNota(campoTitulo.value, campoContenido.value);
			mostrarFormulario();
		}
	}, false);

	campoTarea.addEventListener("keydown", (e) => {
		if (e.which === 13) {
			if (!e.repeat) {
				if (validarTareas()) {
					addTarea(campoTarea.value);
					formularioTareas.reset();
				}
			}
			e.preventDefault();
		}
	}, false);

	clean(document.body);
	abrirBd();
}

function mostrarFormulario() {
	let _mostrado = formularioNotas.classList.toggle('esconder');
	bNuevaNota.classList.toggle('esconder', !_mostrado);
	if (!_mostrado) {
		formularioNotas.reset();
		campoTitulo.style.backgroundColor = '#333333';
		campoContenido.style.backgroundColor = '#333333';
	}
}

function validarNotas() {
	let _bandera = true;
	
	// Título
	if (!/^.+$/.test(campoTitulo.value)) {
		campoTitulo.style.backgroundColor = 'salmon';
		_bandera = false;
	} else {
		campoTitulo.style.backgroundColor = '#333333';
	}

	// Contenido
	if (!/^.+$/gm.test(campoContenido.value)) {
		campoContenido.style.backgroundColor = 'salmon';
		_bandera = false;
	} else {
		campoContenido.style.backgroundColor = '#333333';
	}

	return _bandera;
}

function validarTareas() {
	return campoTarea.value != "";
}

function clean(node) {
	for(var n = 0; n < node.childNodes.length; n ++)
	{
	  var child = node.childNodes[n];
	  if
	  (
		child.nodeType === 8 
		|| 
		(child.nodeType === 3 && !/\S/.test(child.nodeValue))
	  )
	  {
		node.removeChild(child);
		n --;
	  }
	  else if(child.nodeType === 1)
	  {
		clean(child);
	  }
	}
}

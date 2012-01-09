#! /usr/local/bin/node


var argv = require('optimist').boolean('r').argv
   ,dir_opt = argv._[argv._.length-1]
   ,recursive_opt = (argv.r) ? true : false
   ,size_opt = (process.argv[4] in {'K':"",'M':"",'G':""}) ? process.argv[4] : 'G' 
   ,fs = require('fs')
   ,util = require('util')
   ,spawn = require('child_process').spawn
   ,exec = require('child_process').exec
   ,rendering = false
   ,tree = {}
   ,render_string = ''
   ,children = []
   ;


function update_tree(dir, size, parent_tree){
    var dir_chunks = dir.split('/');
    dir_chunks.shift();
    
    if (dir_chunks.length == 0 || typeof dir_chunks == 'undefined' ){ //we are done updating the tree
	render_tree();
	return;
    }else{
	if (typeof parent_tree == 'undefined'){
	    parent_tree = tree; //saves by reference wow
	    parent_tree['size'] = size;
	}
	
	if( typeof parent_tree[dir_chunks[0]] == 'undefined'){
	    parent_tree[dir_chunks[0]] = {size: size};
	}
	
	return update_tree(dir_chunks.join("/"), size, parent_tree[dir_chunks[0]]);
    }
}

function render_tree(){
    process.stdout.write('\x1b[2J\x1b[H');
    if(rendering == false){
	rendering = true;
	render_paths(tree);
    }
}

function render_paths(branch, level){
    if(typeof branch['size'] == 'undefined'){
	rendering = false;
	return;
    };

    var level = (typeof level == 'undefined')? 0 : level
        ,indent = "";
    

    for (var i=0; i<level+1; i++){
	indent += " ";
    }
    
    if(branch == tree && level == 0){ 
	//render_string += '/\n';
	console.log('/');
    }
    
    for (var prop in branch){
	if(prop != 'size'){
	    console.log(indent+"/"+prop+" "+branch[prop]['size']);
	    //render_string += indent+branch[prop]['size']+" "+prop+"/\n";
	}

	if(typeof branch[prop] == 'object'){
	 render_paths(branch[prop], level+1);
	}
    }
    
    
    render_string = '';
    rendering = false;
    return;
}



function du_child(dir, size_opt){
  var du = spawn('du', ['-sh', dir]);
    
  children.push(du);

  du.stdout.on('data', function(data){
      var data = data.toString()
          ,size = data.split("\t")[0];
      
      if(size.charAt(size.length-1) == size_opt){
	  update_tree(dir, size);
      }
  });

  du.stderr.on('data', function(data){
      console.log('stderr: '+data);
  });
}

function killChildren(){
    for(var i; i<children.length; i++){
	children[i].kill('SIGTERM');
    }
}

function crawl_dir(dir, recursive, size_opt){
    if (recursive == false){
	du_child(dir, size_opt);
    }else{
	fs.readdir(dir, function(err, files){
	    if(err || typeof files == 'undefined' || files.length == 0){return;}
	    for(var i=0; i<files.length; i++){
		(function (i){
		    var full_path = (dir == '/') ? dir+files[i] : dir+"/"+files[i];
		    fs.stat(full_path, function(err, stats){
			if(err){ return;}
			if(stats.isDirectory()){ 
			    du_child(full_path, size_opt);
			    crawl_dir(full_path, recursive, size_opt);
			}
		    });
		})(i);
	    }
	});
    }
}


process.on('exit', killChildren);
crawl_dir(dir_opt, recursive_opt, size_opt);

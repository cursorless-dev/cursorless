" http://neovim.io/doc/user/remote_plugin.html
" similar to having the plugins into rplugin/node and running :UpdateRemotePlugins
" except here we don't need the user to run that command
function RegisterFunctions(cursorless_nvim_path)
     call remote#host#RegisterPlugin('node', a:cursorless_nvim_path . '/node/command-server', [
          \ {'sync': v:false, 'name': 'CommandServerLoadExtension', 'type': 'function', 'opts': {}},
          \ {'sync': v:false, 'name': 'CommandServerRunCommand', 'type': 'function', 'opts': {}},
          \ ])
     call remote#host#RegisterPlugin('node', a:cursorless_nvim_path . 'node/cursorless-neovim', [
          \ {'sync': v:false, 'name': 'CursorlessLoadExtension', 'type': 'function', 'opts': {}},
          \ ])
     call remote#host#RegisterPlugin('node', a:cursorless_nvim_path . 'node/test-harness', [
          \ {'sync': v:false, 'name': 'TestHarnessRun', 'type': 'function', 'opts': {}},
          \ ])
endfunction

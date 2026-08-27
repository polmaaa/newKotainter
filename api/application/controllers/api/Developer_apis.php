<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Developer_apis extends MY_Controller {

    protected $protected = true;

    public function __construct() {
        parent::__construct();
    }

    private function _check_admin() {
        $level = strtoupper($this->session->userdata('level_user'));
        if ($level !== 'DEVELOPER' && $level !== 'SUPERUSER') {
            $this->response(403, 'error', 'Forbidden: Anda tidak memiliki akses untuk operasi ini.');
            exit;
        }
    }

    private function _get_config_path() {
        return APPPATH . 'config/developer_apis.json';
    }

    public function get_apis() {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }

        $path = $this->_get_config_path();
        if (!is_file($path)) {
            return $this->response(200, 'success', 'File konfigurasi kosong.', array());
        }

        $content = file_get_contents($path);
        $data = json_decode($content, true);
        if (!is_array($data)) {
            $data = array();
        }

        return $this->response(200, 'success', 'Berhasil memuat list API.', $data);
    }

    private function _generate_file_skeleton($filePath, $type, $className, $modelName = '') {
        $normalizedPath = str_replace('\\', '/', $filePath);
        $cleanPath = str_replace('api/application/', '', $normalizedPath);
        $cleanPath = str_replace('application/', '', $cleanPath);
        $absolutePath = APPPATH . ltrim($cleanPath, '/');

        if (file_exists($absolutePath)) {
            return; // File already exists, don't overwrite
        }

        // Create parent directories if they don't exist
        $dir = dirname($absolutePath);
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }

        // Generate template
        if ($type === 'controller') {
            $template = "<?php\n"
                      . "defined('BASEPATH') OR exit('No direct script access allowed');\n\n"
                      . "class {$className} extends MY_Controller {\n\n"
                      . "    protected \$protected = true;\n\n"
                      . "    public function __construct() {\n"
                      . "        parent::__construct();\n";
            if (!empty($modelName)) {
                $template .= "        \$this->load->model('" . strtolower($modelName) . "');\n";
            }
            $template .= "    }\n\n"
                      . "    public function get_data() {\n"
                      . "        if (\$_SERVER['REQUEST_METHOD'] !== 'GET') {\n"
                      . "            return \$this->response(405, 'error', 'Method Not Allowed');\n"
                      . "        }\n"
                      . "        return \$this->response(200, 'success', 'GET method implemented.');\n"
                      . "    }\n\n"
                      . "    public function save() {\n"
                      . "        if (\$_SERVER['REQUEST_METHOD'] !== 'POST') {\n"
                      . "            return \$this->response(405, 'error', 'Method Not Allowed');\n"
                      . "        }\n"
                      . "        return \$this->response(200, 'success', 'POST method implemented.');\n"
                      . "    }\n"
                      . "}\n";
        } else {
            $template = "<?php\n"
                      . "defined('BASEPATH') OR exit('No direct script access allowed');\n\n"
                      . "class {$className} extends CI_Model {\n\n"
                      . "    public function __construct() {\n"
                      . "        parent::__construct();\n"
                      . "    }\n"
                      . "}\n";
        }

        @file_put_contents($absolutePath, $template);
    }

    public function save_api() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }
        $this->_check_admin();

        $json_data = json_decode($this->input->raw_input_stream, true);
        if (empty($json_data)) {
            return $this->response(400, 'error', 'Format data tidak valid.');
        }

        $id = isset($json_data['id']) && $json_data['id'] !== '' ? intval($json_data['id']) : null;
        $name = isset($json_data['name']) ? trim($json_data['name']) : '';
        $parent = isset($json_data['parent']) ? trim($json_data['parent']) : '';
        
        if (empty($name) || empty($parent)) {
            return $this->response(400, 'error', 'Nama Menu dan Parent Menu wajib diisi!');
        }

        $oracle = isset($json_data['oracle']) ? $json_data['oracle'] : null;
        $postgres = isset($json_data['postgres']) ? $json_data['postgres'] : null;

        // Auto-generate file skeletons if files are not present
        if ($oracle) {
            $controllerPath = isset($oracle['controller']) ? trim($oracle['controller']) : '';
            $modelPath = isset($oracle['model']) ? trim($oracle['model']) : '';
            $cName = !empty($controllerPath) ? str_replace('.php', '', basename($controllerPath)) : '';
            $mName = !empty($modelPath) ? str_replace('.php', '', basename($modelPath)) : '';
            
            if (!empty($controllerPath) && !empty($cName)) {
                $this->_generate_file_skeleton($controllerPath, 'controller', $cName, $mName);
            }
            if (!empty($modelPath) && !empty($mName)) {
                $this->_generate_file_skeleton($modelPath, 'model', $mName);
            }
        }
        if ($postgres) {
            $controllerPath = isset($postgres['controller']) ? trim($postgres['controller']) : '';
            $modelPath = isset($postgres['model']) ? trim($postgres['model']) : '';
            $cName = !empty($controllerPath) ? str_replace('.php', '', basename($controllerPath)) : '';
            $mName = !empty($modelPath) ? str_replace('.php', '', basename($modelPath)) : '';
            
            if (!empty($controllerPath) && !empty($cName)) {
                $this->_generate_file_skeleton($controllerPath, 'controller', $cName, $mName);
            }
            if (!empty($modelPath) && !empty($mName)) {
                $this->_generate_file_skeleton($modelPath, 'model', $mName);
            }
        }

        // Load existing
        $path = $this->_get_config_path();
        $apis = array();
        if (is_file($path)) {
            $apis = json_decode(file_get_contents($path), true);
            if (!is_array($apis)) {
                $apis = array();
            }
        }

        if ($id === null) {
            // Add new
            $max_id = 0;
            foreach ($apis as $item) {
                if (isset($item['id']) && $item['id'] > $max_id) {
                    $max_id = $item['id'];
                }
            }
            $id = $max_id + 1;
            
            $new_item = array(
                'id' => $id,
                'name' => $name,
                'parent' => $parent,
                'oracle' => $oracle,
                'postgres' => $postgres
            );
            $apis[] = $new_item;
        } else {
            // Edit existing
            $found = false;
            foreach ($apis as &$item) {
                if (isset($item['id']) && $item['id'] === $id) {
                    $item['name'] = $name;
                    $item['parent'] = $parent;
                    $item['oracle'] = $oracle;
                    $item['postgres'] = $postgres;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                return $this->response(404, 'error', 'API metadata tidak ditemukan.');
            }
        }

        // Save
        $success = file_put_contents($path, json_encode($apis, JSON_PRETTY_PRINT));
        if ($success !== false) {
            return $this->response(200, 'success', 'Dokumentasi API berhasil disimpan.');
        } else {
            return $this->response(500, 'error', 'Gagal menulis ke berkas json.');
        }
    }

    public function delete_api() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->response(405, 'error', 'Method Not Allowed');
        }
        $this->_check_admin();

        $json_data = json_decode($this->input->raw_input_stream, true);
        $id = isset($json_data['id']) ? intval($json_data['id']) : null;

        if ($id === null) {
            return $this->response(400, 'error', 'ID API wajib disertakan.');
        }

        $path = $this->_get_config_path();
        if (!is_file($path)) {
            return $this->response(404, 'error', 'Konfigurasi API kosong.');
        }

        $apis = json_decode(file_get_contents($path), true);
        if (!is_array($apis)) {
            $apis = array();
        }

        $new_apis = array();
        $found = false;
        foreach ($apis as $item) {
            if (isset($item['id']) && $item['id'] === $id) {
                $found = true;
                continue;
            }
            $new_apis[] = $item;
        }

        if (!$found) {
            return $this->response(404, 'error', 'API dengan ID tersebut tidak ditemukan.');
        }

        $success = file_put_contents($path, json_encode($new_apis, JSON_PRETTY_PRINT));
        if ($success !== false) {
            return $this->response(200, 'success', 'API berhasil dihapus dari dokumentasi.');
        } else {
            return $this->response(500, 'error', 'Gagal memperbarui berkas json.');
        }
    }
}

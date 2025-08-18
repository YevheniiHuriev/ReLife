<?php

namespace App\Http\Controllers;

class BaseController extends Controller
{
    public function send_response($result, $message)  {
        $response = [
            'success' => true,
            'data' => $result,
            'message' => $message
        ];
        return response()->json($response, 200);
    }
    public function send_error($error, $error_messages =[], $code=404) {
        $response = [
            'success' => false,
            'message' => $error
        ];
        if(!empty($error_messages)) {
            $response['data'] = $error_messages;
        }
        return response()->json($response, $code);
    }
}

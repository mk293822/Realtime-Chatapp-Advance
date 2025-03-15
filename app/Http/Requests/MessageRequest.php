<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        return [
            "message" => 'nullable|string',
            "group_id" => 'nullable|exists:groups,id',
            "receiver_id" => 'nullable|exists:users,id',
            "conversation_id" => 'nullable|exists:conversations,id',
            "attachments" => "nullable|array|max:10",
            "attachments.*" => 'file|max:1024000',
            'save_conversation_id' => 'nullable|exists:message_saved_conversations,id',
            "payload" => 'nullable|string',
            "type" => 'nullable|string',
            'timer' => 'nullable|string',
        ];
    }
}
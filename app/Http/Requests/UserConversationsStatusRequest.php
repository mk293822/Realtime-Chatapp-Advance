<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class UserConversationsStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function prepareForValidation()
    {
        $data = $this->all();

        if (!$this->has('conversation_id') || !$this->input('conversation_id')) {
            $this->merge([
                'conversation_id' => null
            ]);
        }
        if (!$this->has('group_id') || !$this->input('group_id')) {
            $this->merge([
                'group_id' => null
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "user_id" => "required|exists:users,id",
            "group_id" => 'required_without:conversation_id|nullable|exists:groups,id',
            "conversation_id" => 'required_without:group_id|nullable|exists:conversations,id',
            "status" => "nullable|string"
        ];
    }
}
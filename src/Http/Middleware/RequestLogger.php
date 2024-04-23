<?php

namespace Sawmainek\Apitoolz\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequestLogger
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if( \Str::startsWith($request->path(), 'api/')) {
            $uuid = (string) \Str::uuid();
            $header = $request->header();
            $data = $request->all();
            unset($header['authorization']);
            unset($data['password']);
            unset($data['password_confirmation']);
            unset($data['current_password']);
            \Log::info("[Request]   {$request->method()}::/{$request->path()} >>",[
                'request_id'=>$uuid,
                'header' => $header,
                'data' => $data
            ]);
            $request->headers->set('X-Request-ID', $uuid);
        }
        return $next($request);
    }
}

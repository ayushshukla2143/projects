@app.post("/api/generate-content")
async def generate_content(request: ContentGenerationRequest):
    if not gemini_configured:
        raise HTTPException(
            status_code=503, 
            detail="AI service not configured. Please add GEMINI_API_KEY to .env file"
        )
    
    try:
        print(f"🤖 Generating content for: {request.prompt}")
        
        # Optimized prompt for faster generation
        prompt = f"""Write a comprehensive but concise blog post about: {request.prompt}

Structure:
- Engaging introduction
- 2-3 main points with subheadings
- Practical examples
- Conclusion

Use markdown formatting with ## headings. Keep it under 500 words."""

        response = gemini_model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=1000,  # Limit length for faster generation
                temperature=0.7,
            )
        )
        
        if response.text:
            print("✅ Content generated successfully!")
            return {"content": response.text}
        else:
            raise Exception("Empty response from AI")
            
    except Exception as e:
        print(f"❌ AI Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
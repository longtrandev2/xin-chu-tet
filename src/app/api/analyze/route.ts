import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  let name = "";
  let wish = "";
  try {
    const body = await request.json();
    name = body.name || "";
    wish = body.wish || "";

    if (!name || !wish) {
      return NextResponse.json(
        { error: "Cần nhập tên và ước nguyện" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        word: "Tâm",
        meaning: `Kính gửi ${name},\n\nTa đã lắng nghe tâm tư của con: "${wish}".\n\nChữ "Tâm" - là gốc rễ của muôn sự. Con người có tâm sáng thì vạn sự hanh thông, có tâm thiện thì phúc đức dài lâu. Ước nguyện của con xuất phát từ một tấm lòng chân thành, ta thấy trong đó có sự hướng thiện, có khát vọng vươn lên.\n\nNăm mới Bính Ngọ, ngựa phi vạn dặm, con hãy giữ vững cái tâm, thì mọi nguyện ước sẽ thành hiện thực. Tâm an thì trí sáng, trí sáng thì đường quang.`,
        poem: `Tâm sáng ngời như ngọc giữa đêm,\nĐường xuân rộng mở bước chân êm.`,
      });
    }

    const prompt = `Ngươi là một ông đồ già đã ngoài bảy mươi, cả đời gắn bó với nghiên bút mực tàu. Ngươi ngồi bên gốc đào già trước cổng chùa, cho chữ nhân ngày đầu xuân năm Bính Ngọ.

Có một người tên "${name}" đến xin chữ. Họ thành tâm chia sẻ ước nguyện, tâm tư của mình như sau:
"${wish}"

Hãy thực hiện các bước sau:

1. Suy ngẫm thật kỹ về tâm tư, ước nguyện này.
2. Chọn MỘT CHỮ HÁN VIỆT duy nhất (1 chữ thôi, ví dụ: Tâm, Đức, Nhẫn, Trí, Duyên, Phúc, Lộc, An, Hòa, Tín, Nghĩa, Hiếu, Thuận, Thành, Đạo, Thiện, Nhân, Lễ, Chí, Dũng...) phù hợp nhất với ước nguyện.
3. Viết một đoạn bình giải (200-300 chữ) bằng văn phong cổ kính, sâu sắc, giải thích vì sao tặng chữ này cho người đó. Phải liên hệ mật thiết với ước nguyện của họ. Xưng "ta" và gọi người xin chữ là "con".
4. Sáng tác một câu đối 2 câu (thơ lục bát hoặc thất ngôn) tặng riêng cho người này, liên quan đến chữ đã cho và ước nguyện của họ.

Trả về đúng JSON format (KHÔNG markdown, KHÔNG code block):
{"word": "Chữ được chọn", "meaning": "Đoạn bình giải chi tiết...", "poem": "Câu 1\\nCâu 2"}

Lưu ý: 
- Chỉ trả về JSON thuần túy, không có \`\`\`json hay bất kỳ markdown nào
- "word" chỉ chứa 1 chữ Hán Việt duy nhất
- "poem" gồm 2 câu, ngăn cách bởi \\n
- Văn phong phải trang trọng, cổ kính, uyên bác`;

    // Thử các model theo thứ tự ưu tiên
    const modelNames = ["gemini-3-pro-preview", "gemini-2.5-flash", "gemini-2.0-flash"];
    let aiResult = null;

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        aiResult = await model.generateContent(prompt);
        break;
      } catch {
        continue;
      }
    }

    if (!aiResult) {
      throw new Error("All models quota exceeded");
    }

    const text = aiResult.response.text();

    // Parse JSON từ response
    let parsed;
    try {
      const cleanText = text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      parsed = JSON.parse(cleanText);
    } catch {
      parsed = {
        word: "Phúc",
        meaning: `Kính gửi ${name},\n\nTa ngồi dưới gốc đào già, đọc lá thư tâm tư của con mà lòng xúc động. Con ước nguyện: "${wish}".\n\nTa tặng con chữ "Phúc" - phúc lành là điều quý giá nhất trên đời. Người có phúc thì tai qua nạn khỏi, vạn sự như ý. Năm Bính Ngọ, ngựa trời hí vang, ta chúc con phúc đầy nhà, lộc đầy sân.`,
        poem: `Phúc đến cửa nhà xuân mãi thắm,\nLộc tràn sân ngõ Tết thêm vui.`,
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({
      word: "Phúc",
      meaning: `Kính gửi ${name || "con"},\n\nTa ngồi dưới gốc đào già, ngẫm về tâm tư của con mà lòng cảm khái. Ước nguyện của con: "${wish || ""}".\n\nTa tặng con chữ "Phúc" — phúc lành là điều quý giá nhất trên đời. Người có phúc thì mọi nẻo đường đều hanh thông, tai qua nạn khỏi, vạn sự như ý. Chữ Phúc không chỉ là may mắn, mà còn là phước đức do chính con gieo trồng từ những việc thiện, lời nói tốt, tấm lòng rộng mở.\n\nNăm Bính Ngọ, ngựa trời hí vang, con hãy sống hết mình với ước nguyện, giữ tâm sáng, hành thiện tích đức, ắt phúc sẽ tự tìm đến. Phúc đức tại mẫu — phúc lành từ tâm mà ra, ta tin rằng con sẽ gặt hái được điều mình mong muốn.`,
      poem: `Phúc đến cửa nhà xuân mãi thắm,\nLộc tràn sân ngõ Tết thêm vui.`,
    });
  }
}

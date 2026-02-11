---
title: 'Removing Animations in PowerPoint'
description: 'Something totally different, but hopefully this will save another Entrepreneur using some PowerPoint Templates (I’m using the Voodoo Presentation from TemplateZuu right now) some precious hours. While it’s handy to...'
pubDate: 'Apr 29 2021'
categories: ['coding', 'powerpoint', 'visual basic']
heroImage: 'image.png'
---

Something totally different, but hopefully this will save another Entrepreneur using some PowerPoint Templates (I’m using the [Voodoo Presentation from TemplateZuu](https://creativemarket.com/TemplateZuu/2690981-SALE-20-Voodoo-Presentation-3.7) right now) some precious hours.

While it’s handy to have a lot of templates done, I found the animations pretty annoying. But as lazy I am I didn’t want to click all 100+ Master Slides to get the animations removed. So I just added this VBA Code (Visual Basic for Applications) to one PPT and opened all other presentations – and executed the `removeAnimationsFromOpenPresentations` macro.

```
Sub removeAnimationsFromOpenPresentations()
    Dim myPpt As Presentation
    Debug.Print "Open ppt's : "; Application.Presentations.Count & vbCrLf
    For Each myPpt In Application.Presentations
        Debug.Print myPpt.Name
        Call removeAnimations(myPpt)
    Next myPpt
End Sub
Private Sub removeSequences(ByRef tl As TimeLine)
    For i = tl.MainSequence.Count To 1 Step -1
        tl.MainSequence(i).Delete
    Next i
End Sub
Private Sub removeAnimations(ppt As Presentation)
    Dim d As design
    Dim m As Master
    Dim cl As CustomLayout
    Dim s As Slide
    For Each d In ppt.Designs
        Set m = d.SlideMaster
        removeSequences m.TimeLine
        For Each cl In m.CustomLayouts
            removeSequences cl.TimeLine
        Next 'cl
    Next 'd
    For Each s In ppt.Slides
        removeSequences s.TimeLine
    Next 's
    ' Turn on animations again
    ppt.SlideShowSettings.ShowWithAnimation = msoTrue
End Sub
```
